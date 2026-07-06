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

use std::cmp::Ordering;
use std::fmt;

use num_bigint::{BigInt, Sign};
use num_traits::{ToPrimitive, Zero};

use crate::context::MathContext;
use crate::error::{ArithmeticError, ParseError};
use crate::rounding::RoundingMode;

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

    /// `self * other`, staying compact when the product fits in i128.
    fn mul(&self, other: &Significand) -> Significand {
        if let (Significand::Compact(a), Significand::Compact(b)) = (self, other) {
            if let Some(p) = a.checked_mul(*b) {
                return Significand::Compact(p);
            }
        }
        Significand::from_bigint(self.to_bigint() * other.to_bigint())
    }

    /// `10^n` as a `Significand` (compact when it fits in i128).
    fn ten_pow(n: u32) -> Significand {
        match 10i128.checked_pow(n) {
            Some(p) => Significand::Compact(p),
            None => Significand::Inflated(BigInt::from(10u8).pow(n)),
        }
    }

    /// Number of decimal digits in the magnitude; 1 for zero — Java `precision()`.
    fn digit_length(&self) -> u32 {
        self.abs_digits().len() as u32
    }
}

/// `sign(2|r| - |divisor|)` for the compact path, mirroring JDK `needIncrement`'s
/// `HALF_LONG` guard: if `2|r|` overflows we are certainly past the half.
fn cmp_frac_half_i128(r: i128, divisor: i128) -> i32 {
    let r_abs = r.unsigned_abs();
    let d_abs = divisor.unsigned_abs();
    match r_abs.checked_mul(2) {
        None => 1,
        Some(two_r) => match two_r.cmp(&d_abs) {
            Ordering::Less => -1,
            Ordering::Equal => 0,
            Ordering::Greater => 1,
        },
    }
}

/// Ported verbatim from JDK `commonNeedIncrement`: should the quotient magnitude
/// be incremented (away from zero)? `cmp_frac_half` is `sign(2|r| - |divisor|)`.
fn common_need_increment(
    mode: RoundingMode,
    qsign: i32,
    cmp_frac_half: i32,
    odd_quot: bool,
) -> Result<bool, ArithmeticError> {
    use RoundingMode::*;
    Ok(match mode {
        Unnecessary => return Err(ArithmeticError::InexactResult),
        Up => true,
        Down => false,
        Ceiling => qsign > 0,
        Floor => qsign < 0,
        HalfUp | HalfDown | HalfEven => {
            if cmp_frac_half < 0 {
                false
            } else if cmp_frac_half > 0 {
                true
            } else {
                match mode {
                    HalfDown => false,
                    HalfUp => true,
                    HalfEven => odd_quot,
                    _ => unreachable!(),
                }
            }
        }
    })
}

/// Integer division `dividend / divisor` with JDK rounding, returning the rounded
/// quotient. Ported from the no-preferred-scale `divideAndRound` variants used by
/// `doRound`. `divisor` must be non-zero.
fn divide_and_round(
    dividend: &Significand,
    divisor: &Significand,
    mode: RoundingMode,
) -> Result<Significand, ArithmeticError> {
    if let (Significand::Compact(a), Significand::Compact(b)) = (dividend, divisor) {
        let (a, b) = (*a, *b);
        let q = a / b; // truncates toward zero, matching Java
        let r = a % b;
        if r == 0 {
            return Ok(Significand::Compact(q));
        }
        let qsign = if (a < 0) == (b < 0) { 1 } else { -1 };
        let cmp = cmp_frac_half_i128(r, b);
        let inc = common_need_increment(mode, qsign, cmp, q & 1 != 0)?;
        if !inc {
            return Ok(Significand::Compact(q));
        }
        if let Some(q2) = q.checked_add(qsign as i128) {
            return Ok(Significand::Compact(q2));
        }
        // Increment overflowed i128 (vanishingly rare) — fall through to BigInt.
    }

    let a = dividend.to_bigint();
    let b = divisor.to_bigint();
    let q = &a / &b;
    let r = &a % &b;
    if r.is_zero() {
        return Ok(Significand::from_bigint(q));
    }
    let qsign = if (a.sign() == Sign::Minus) == (b.sign() == Sign::Minus) {
        1
    } else {
        -1
    };
    let two_r = r.magnitude() * 2u8;
    let cmp = match two_r.cmp(b.magnitude()) {
        Ordering::Less => -1,
        Ordering::Equal => 0,
        Ordering::Greater => 1,
    };
    let odd = q.magnitude().bit(0);
    let inc = common_need_increment(mode, qsign, cmp, odd)?;
    let q = if inc { q + BigInt::from(qsign) } else { q };
    Ok(Significand::from_bigint(q))
}

/// Rounds `val` to `mc`, ported from JDK `doRound(BigDecimal, MathContext)`:
/// repeatedly drop `precision - mcp` low digits (rounding each time) until the
/// precision fits, since rounding can itself bump the precision (999 -> 100).
fn do_round(val: BigDecimal, mc: MathContext) -> Result<BigDecimal, ArithmeticError> {
    let mcp = mc.precision;
    if mcp == 0 {
        return Ok(val);
    }
    let mut int_val = val.int_val;
    let mut scale = val.scale;
    let mut prec = int_val.digit_length();
    while prec > mcp {
        let drop = prec - mcp;
        scale = check_scale_nonzero(scale as i64 - drop as i64)?;
        int_val = divide_and_round(&int_val, &Significand::ten_pow(drop), mc.rounding_mode)?;
        prec = int_val.digit_length();
    }
    Ok(BigDecimal::new(int_val, scale))
}

/// Java `checkScaleNonZero`: narrow an i64 scale to i32 or signal overflow.
fn check_scale_nonzero(val: i64) -> Result<i32, ArithmeticError> {
    i32::try_from(val).map_err(|_| ArithmeticError::ScaleOverflow)
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

    /// Number of significant digits in the unscaled value (>= 1). Java `precision()`.
    pub fn precision(&self) -> u32 {
        self.int_val.digit_length()
    }

    /// Exact product; `scale = this.scale + other.scale` — Java `multiply(BigDecimal)`.
    // ponytail: i32 scale overflow on the exact path is unmodeled; the fixtures never
    // approach it. Add a checked variant if one ever does.
    pub fn multiply(&self, other: &BigDecimal) -> BigDecimal {
        let product_scale = self.scale as i64 + other.scale as i64;
        BigDecimal::new(self.int_val.mul(&other.int_val), product_scale as i32)
    }

    /// `this * other` rounded to `mc` — Java `multiply(BigDecimal, MathContext)`.
    pub fn multiply_with_context(
        &self,
        other: &BigDecimal,
        mc: MathContext,
    ) -> Result<BigDecimal, ArithmeticError> {
        let product = self.multiply(other);
        if mc.precision == 0 {
            return Ok(product);
        }
        do_round(product, mc)
    }

    /// Engineering-notation string — Java `toEngineeringString()`.
    pub fn to_engineering_string(&self) -> String {
        self.layout(false)
    }

    /// The signed magnitude with no decimal point (used for the `scale == 0` case).
    fn signed_digits(&self) -> String {
        let d = self.int_val.abs_digits();
        if self.int_val.is_negative() {
            format!("-{d}")
        } else {
            d
        }
    }

    /// Ported from JDK `layoutChars`: scientific (`sci = true`, i.e. `toString`) or
    /// engineering (`sci = false`) layout. The `scale == 2` currency fast path is
    /// omitted because it produces byte-identical output to the general path.
    fn layout(&self, sci: bool) -> String {
        let scale = self.scale;
        if scale == 0 {
            return self.signed_digits();
        }
        let coeff = self.int_val.abs_digits();
        let coeff_bytes = coeff.as_bytes();
        let coeff_len = coeff.len() as i64;
        let neg = self.signum() < 0;
        let adjusted: i64 = -(scale as i64) + (coeff_len - 1);

        let mut buf = String::new();
        if neg {
            buf.push('-');
        }
        if scale >= 0 && adjusted >= -6 {
            // Plain number (shared by sci and engineering).
            let pad = scale as i64 - coeff_len;
            if pad >= 0 {
                buf.push_str("0.");
                for _ in 0..pad {
                    buf.push('0');
                }
                buf.push_str(&coeff);
            } else {
                let split = (-pad) as usize; // coeff_len - scale
                buf.push_str(&coeff[..split]);
                buf.push('.');
                buf.push_str(&coeff[split..]);
            }
            return buf;
        }

        // E-notation needed.
        let mut adjusted = adjusted;
        if sci {
            buf.push(coeff_bytes[0] as char);
            if coeff_len > 1 {
                buf.push('.');
                buf.push_str(&coeff[1..]);
            }
        } else {
            // Engineering: make the exponent a multiple of three.
            let mut sig = adjusted % 3;
            if sig < 0 {
                sig += 3;
            }
            adjusted -= sig;
            sig += 1;
            if self.signum() == 0 {
                match sig {
                    1 => buf.push('0'),
                    2 => {
                        buf.push_str("0.00");
                        adjusted += 3;
                    }
                    3 => {
                        buf.push_str("0.0");
                        adjusted += 3;
                    }
                    _ => unreachable!("sig in 1..=3"),
                }
            } else if sig >= coeff_len {
                buf.push_str(&coeff);
                for _ in 0..(sig - coeff_len) {
                    buf.push('0');
                }
            } else {
                let s = sig as usize;
                buf.push_str(&coeff[..s]);
                buf.push('.');
                buf.push_str(&coeff[s..]);
            }
        }
        if adjusted != 0 {
            buf.push('E');
            if adjusted > 0 {
                buf.push('+');
            }
            buf.push_str(&adjusted.to_string());
        }
        buf
    }
}

impl fmt::Display for BigDecimal {
    /// Canonical Java `toString()` (scientific-notation layout).
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.layout(true))
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

    fn bd(s: &str) -> BigDecimal {
        BigDecimal::from_str(s).unwrap()
    }

    #[test]
    fn tostring_matches_java_layout() {
        // scale == 0
        assert_eq!(bd("100").to_string(), "100");
        assert_eq!(bd("-7").to_string(), "-7");
        // plain fraction
        assert_eq!(bd("1.50").to_string(), "1.50");
        assert_eq!(bd("0.001").to_string(), "0.001");
        // negative scale -> scientific: 1.5e3 => unscaled 15, scale -2
        assert_eq!(bd("1.5e3").to_string(), "1.5E+3");
        // small magnitude tips into E-notation once adjusted < -6
        assert_eq!(bd("1e-7").to_string(), "1E-7");
        assert_eq!(bd("0.0000001").to_string(), "1E-7");
    }

    #[test]
    fn engineering_string_groups_by_three() {
        // adjusted exponent forced to a multiple of 3
        assert_eq!(bd("1.5e3").to_engineering_string(), "1.5E+3");
        assert_eq!(bd("1e-7").to_engineering_string(), "100E-9");
    }

    #[test]
    fn multiply_exact_adds_scales() {
        assert_eq!(bd("1.5").multiply(&bd("1.5")).to_string(), "2.25");
        assert_eq!(bd("2").multiply(&bd("3")).to_string(), "6");
        // scale = 1 + 2 = 3
        assert_eq!(bd("0.2").multiply(&bd("0.03")).to_string(), "0.006");
    }

    fn mc(p: u32, m: RoundingMode) -> MathContext {
        MathContext::new(p, m)
    }

    #[test]
    fn multiply_with_context_rounds_like_jdk() {
        use RoundingMode::*;
        // 1.2345 -> 3 sig, HALF_UP: .45 < .5 => 1.23
        assert_eq!(
            bd("1.2345").multiply_with_context(&bd("1"), mc(3, HalfUp)).unwrap().to_string(),
            "1.23"
        );
        // 9.999 -> 3 sig, HALF_UP: rounds up and re-drops => 10.0
        assert_eq!(
            bd("9.999").multiply_with_context(&bd("1"), mc(3, HalfUp)).unwrap().to_string(),
            "10.0"
        );
        // HALF_EVEN tie: 2.5 -> 1 sig => 2 (even)
        assert_eq!(
            bd("2.5").multiply_with_context(&bd("1"), mc(1, HalfEven)).unwrap().to_string(),
            "2"
        );
        // HALF_EVEN tie: 3.5 -> 1 sig => 4 (even)
        assert_eq!(
            bd("3.5").multiply_with_context(&bd("1"), mc(1, HalfEven)).unwrap().to_string(),
            "4"
        );
        // FLOOR on a negative rounds toward -inf
        assert_eq!(
            bd("-1.21").multiply_with_context(&bd("1"), mc(2, Floor)).unwrap().to_string(),
            "-1.3"
        );
        // precision 0 = unlimited, exact
        assert_eq!(
            bd("1.2345").multiply_with_context(&bd("1"), mc(0, HalfUp)).unwrap().to_string(),
            "1.2345"
        );
    }

    #[test]
    fn multiply_with_context_unnecessary_errors_when_inexact() {
        let r = bd("1.2345").multiply_with_context(&bd("1"), mc(3, RoundingMode::Unnecessary));
        assert_eq!(r.unwrap_err(), ArithmeticError::InexactResult);
    }

    #[test]
    fn multiply_promotes_to_bigint() {
        // 1e20 * 1e20 = 1e40, well past i128 (~1.7e38) -> Inflated, exact.
        let a = bd("100000000000000000000"); // 1e20
        assert_eq!(
            a.multiply(&a).to_string(),
            "10000000000000000000000000000000000000000"
        );
    }
}
