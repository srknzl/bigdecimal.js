//! The `BigDecimal` value type and its `Significand` representation.
//!
//! Value model (identical to Java): a `BigDecimal` is `unscaledValue * 10^(-scale)`
//! where `scale` is a signed 32-bit integer. The unscaled value is stored as a
//! `Significand`: an `i128` on the stack for the common case (~38 digits), or a
//! heap `BigInt` only when it genuinely overflows i128. This replaces Java's
//! `intCompact`/`INFLATED` sentinel pair with a real algebraic type.
//!
//! This is the P0 slice: construction (str / i128), `add`, `scale`, and
//! `toPlainString`. Multiplication, division, rounding and the rest land in
//! later phases against the JDK-26 fixtures.

use num_bigint::{BigInt, Sign};
use num_traits::{ToPrimitive, Zero};

use crate::error::ParseError;

/// The unscaled integer value. `Compact` keeps small numbers on the stack;
/// `Inflated` is used only when a value does not fit in `i128`.
#[derive(Debug, Clone, PartialEq, Eq)]
enum Significand {
    Compact(i128),
    Inflated(BigInt),
}

impl Significand {
    /// Normalize a `BigInt` into the most compact representation, downgrading to
    /// `Compact` whenever it fits in `i128`. Keeping this invariant means the
    /// fast path stays hot even after operations that route through `BigInt`.
    fn from_bigint(v: BigInt) -> Significand {
        match v.to_i128() {
            Some(c) => Significand::Compact(c),
            None => Significand::Inflated(v),
        }
    }

    fn to_bigint(&self) -> BigInt {
        match self {
            Significand::Compact(c) => BigInt::from(*c),
            Significand::Inflated(b) => b.clone(),
        }
    }

    fn is_zero(&self) -> bool {
        match self {
            Significand::Compact(c) => *c == 0,
            Significand::Inflated(b) => b.is_zero(),
        }
    }

    fn is_negative(&self) -> bool {
        match self {
            Significand::Compact(c) => *c < 0,
            Significand::Inflated(b) => b.sign() == Sign::Minus,
        }
    }

    /// Decimal digits of the absolute value, no sign, no leading zeros
    /// ("0" for zero). Used by the string formatters.
    fn abs_digits(&self) -> String {
        match self {
            Significand::Compact(c) => c.unsigned_abs().to_string(),
            Significand::Inflated(b) => b.magnitude().to_string(),
        }
    }

    /// `self + other`, staying compact when possible and only promoting to
    /// `BigInt` on i128 overflow.
    fn add(&self, other: &Significand) -> Significand {
        if let (Significand::Compact(a), Significand::Compact(b)) = (self, other) {
            if let Some(sum) = a.checked_add(*b) {
                return Significand::Compact(sum);
            }
        }
        Significand::from_bigint(self.to_bigint() + other.to_bigint())
    }

    /// `self * 10^n`, staying compact when the multiplier and product both fit.
    fn mul_pow10(&self, n: u32) -> Significand {
        if n == 0 {
            return self.clone();
        }
        if let Significand::Compact(a) = self {
            if let Some(p) = 10i128.checked_pow(n) {
                if let Some(prod) = a.checked_mul(p) {
                    return Significand::Compact(prod);
                }
            }
        }
        let factor = BigInt::from(10u8).pow(n);
        Significand::from_bigint(self.to_bigint() * factor)
    }
}

/// An arbitrary-precision signed decimal number with JDK `BigDecimal` semantics.
#[derive(Debug, Clone)]
pub struct BigDecimal {
    int_val: Significand,
    scale: i32,
}

impl BigDecimal {
    fn new(int_val: Significand, scale: i32) -> BigDecimal {
        BigDecimal { int_val, scale }
    }

    /// Construct from an `i128` (unscaled, scale 0).
    pub fn from_i128(v: i128) -> BigDecimal {
        BigDecimal::new(Significand::Compact(v), 0)
    }

    /// The scale: the number of digits to the right of the decimal point.
    /// Negative scale means the unscaled value is multiplied by a power of ten.
    pub fn scale(&self) -> i32 {
        self.scale
    }

    /// -1, 0, or 1 as this value is negative, zero, or positive.
    pub fn signum(&self) -> i32 {
        if self.int_val.is_zero() {
            0
        } else if self.int_val.is_negative() {
            -1
        } else {
            1
        }
    }

    /// The unscaled value as a `BigInt` (matches Java `unscaledValue`).
    pub fn unscaled_value(&self) -> BigInt {
        self.int_val.to_bigint()
    }

    /// Parse a decimal string. Accepts optional sign, integer and/or fraction
    /// digits, and an optional `e`/`E` exponent — the same grammar as Java's
    /// `BigDecimal(String)` (no surrounding whitespace).
    pub fn from_str(s: &str) -> Result<BigDecimal, ParseError> {
        let bytes = s.as_bytes();
        if bytes.is_empty() {
            return Err(ParseError::Empty);
        }
        let mut i = 0;
        let mut negative = false;
        match bytes[0] {
            b'+' => i = 1,
            b'-' => {
                negative = true;
                i = 1;
            }
            _ => {}
        }

        // Accumulate the significant digit string (integer + fraction, no dot)
        // and track how many of them are fractional.
        let mut digits = String::new();
        let mut frac_digits: i64 = 0;
        let mut seen_dot = false;
        let mut seen_any_digit = false;
        while i < bytes.len() {
            match bytes[i] {
                b'0'..=b'9' => {
                    digits.push(bytes[i] as char);
                    if seen_dot {
                        frac_digits += 1;
                    }
                    seen_any_digit = true;
                }
                b'.' => {
                    if seen_dot {
                        return Err(ParseError::Malformed);
                    }
                    seen_dot = true;
                }
                b'e' | b'E' => break,
                _ => return Err(ParseError::Malformed),
            }
            i += 1;
        }
        if !seen_any_digit {
            return Err(ParseError::Malformed);
        }

        // Optional exponent.
        let mut exp: i64 = 0;
        if i < bytes.len() {
            // current byte is 'e' or 'E'
            i += 1;
            let mut exp_neg = false;
            if i < bytes.len() && (bytes[i] == b'+' || bytes[i] == b'-') {
                exp_neg = bytes[i] == b'-';
                i += 1;
            }
            let mut exp_any = false;
            while i < bytes.len() {
                match bytes[i] {
                    b'0'..=b'9' => {
                        exp = exp
                            .checked_mul(10)
                            .and_then(|v| v.checked_add((bytes[i] - b'0') as i64))
                            .ok_or(ParseError::ExponentOverflow)?;
                        exp_any = true;
                    }
                    _ => return Err(ParseError::Malformed),
                }
                i += 1;
            }
            if !exp_any {
                return Err(ParseError::Malformed);
            }
            if exp_neg {
                exp = -exp;
            }
        }

        // scale = fractionDigits - exponent (Java's rule).
        let scale_i64 = frac_digits - exp;
        let scale = i32::try_from(scale_i64).map_err(|_| ParseError::ExponentOverflow)?;

        // Parse the digit string into the smallest representation.
        let int_val = match digits.parse::<i128>() {
            Ok(mut c) => {
                if negative {
                    c = -c;
                }
                Significand::Compact(c)
            }
            Err(_) => {
                // Overflowed i128 — go big. `digits` is all ASCII digits here.
                let mag = BigInt::parse_bytes(digits.as_bytes(), 10).ok_or(ParseError::Malformed)?;
                Significand::from_bigint(if negative { -mag } else { mag })
            }
        };

        Ok(BigDecimal::new(int_val, scale))
    }

    /// `self + augend`, exact (no rounding). Aligns the two scales to the larger
    /// of the two, then adds the unscaled values — Java's exact `add`.
    pub fn add(&self, augend: &BigDecimal) -> BigDecimal {
        use std::cmp::Ordering;
        match self.scale.cmp(&augend.scale) {
            Ordering::Equal => {
                BigDecimal::new(self.int_val.add(&augend.int_val), self.scale)
            }
            Ordering::Greater => {
                let shift = (self.scale - augend.scale) as u32;
                let raised = augend.int_val.mul_pow10(shift);
                BigDecimal::new(self.int_val.add(&raised), self.scale)
            }
            Ordering::Less => {
                let shift = (augend.scale - self.scale) as u32;
                let raised = self.int_val.mul_pow10(shift);
                BigDecimal::new(raised.add(&augend.int_val), augend.scale)
            }
        }
    }

    /// String form without an exponent field, matching Java `toPlainString`.
    pub fn to_plain_string(&self) -> String {
        let digits = self.int_val.abs_digits();
        let neg = self.int_val.is_negative();
        let body = if self.scale == 0 {
            digits
        } else if self.scale < 0 {
            // Integer value with trailing zeros appended.
            let zeros = (-(self.scale as i64)) as usize;
            let mut s = digits;
            s.reserve(zeros);
            s.extend(std::iter::repeat('0').take(zeros));
            s
        } else {
            // scale > 0: place the decimal point `scale` digits from the right.
            let insertion = digits.len() as i64 - self.scale as i64;
            if insertion > 0 {
                let idx = insertion as usize;
                format!("{}.{}", &digits[..idx], &digits[idx..])
            } else {
                let lead_zeros = (-insertion) as usize;
                let mut s = String::with_capacity(2 + lead_zeros + digits.len());
                s.push_str("0.");
                s.extend(std::iter::repeat('0').take(lead_zeros));
                s.push_str(&digits);
                s
            }
        };
        if neg {
            format!("-{}", body)
        } else {
            body
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn plain(s: &str) -> String {
        BigDecimal::from_str(s).unwrap().to_plain_string()
    }

    #[test]
    fn parse_and_plainstring_roundtrip() {
        assert_eq!(plain("0"), "0");
        assert_eq!(plain("-0.5"), "-0.5");
        assert_eq!(plain("1.50"), "1.50"); // trailing zero preserved (scale kept)
        assert_eq!(plain("0.00"), "0.00");
        assert_eq!(plain("123"), "123");
        assert_eq!(plain("-123.456"), "-123.456");
        // Exponent handling: 1.5e3 -> scale = 1 - 3 = -2 -> "1500"
        assert_eq!(plain("1.5e3"), "1500");
        // Small fraction from the real fixture set (fits i128, stays compact).
        assert_eq!(
            plain("-0.0000000000000079666993349250232202"),
            "-0.0000000000000079666993349250232202"
        );
    }

    #[test]
    fn add_aligns_scales() {
        let a = BigDecimal::from_str("1.5").unwrap();
        let b = BigDecimal::from_str("2.50").unwrap();
        let sum = a.add(&b);
        assert_eq!(sum.to_plain_string(), "4.00"); // max scale = 2
        assert_eq!(sum.scale(), 2);
    }

    #[test]
    fn add_promotes_to_bigint_on_overflow() {
        // i128 max is ~1.7e38; adding two ~1e38 compacts overflows into Inflated.
        let big = "170000000000000000000000000000000000000"; // 1.7e38
        let a = BigDecimal::from_str(big).unwrap();
        let sum = a.add(&a);
        assert_eq!(sum.to_plain_string(), "340000000000000000000000000000000000000");
        assert_eq!(sum.signum(), 1);
    }

    #[test]
    fn signum_and_unscaled() {
        let n = BigDecimal::from_str("-12.34").unwrap();
        assert_eq!(n.signum(), -1);
        assert_eq!(n.unscaled_value().to_string(), "-1234");
        assert_eq!(n.scale(), 2);
    }
}
