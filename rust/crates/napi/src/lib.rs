//! napi-rs binding: a thin adapter exposing `bigdecimal-core` to Node.
//!
//! This layer knows nothing about the math — it only wraps `core::BigDecimal`,
//! maps `Result::Err` onto JS exceptions, and lets the JS facade own the API
//! ergonomics (union args, aliases). P0 slice: parse / add / string.

use bigdecimal_core::{BigDecimal as CoreBigDecimal, MathContext, RoundingMode};
use napi::bindgen_prelude::*;
use napi_derive::napi;

/// Node-facing handle around a core `BigDecimal`. Methods are auto-camelCased by
/// napi-rs (`to_plain_string` -> `toPlainString`, `from_string` -> `fromString`).
#[napi(js_name = "BigDecimal")]
pub struct BigDecimal {
    inner: CoreBigDecimal,
}

#[napi]
impl BigDecimal {
    /// Parse from a decimal string; throws on malformed input.
    #[napi(factory)]
    pub fn from_string(s: String) -> Result<BigDecimal> {
        CoreBigDecimal::from_str(&s)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    /// Exact addition (no rounding yet).
    #[napi]
    pub fn add(&self, augend: &BigDecimal) -> BigDecimal {
        BigDecimal {
            inner: self.inner.add(&augend.inner),
        }
    }

    #[napi]
    pub fn scale(&self) -> i32 {
        self.inner.scale()
    }

    #[napi]
    pub fn signum(&self) -> i32 {
        self.inner.signum()
    }

    #[napi]
    pub fn to_plain_string(&self) -> String {
        self.inner.to_plain_string()
    }

    /// Exact multiplication.
    #[napi]
    pub fn multiply(&self, multiplicand: &BigDecimal) -> BigDecimal {
        BigDecimal {
            inner: self.inner.multiply(&multiplicand.inner),
        }
    }

    /// Multiplication rounded to a `MathContext` (precision + rounding-mode ordinal).
    #[napi(js_name = "multiplyWithContext")]
    pub fn multiply_with_context(
        &self,
        multiplicand: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let rm = RoundingMode::from_ordinal(rounding_mode)
            .ok_or_else(|| Error::from_reason("Invalid rounding mode"))?;
        self.inner
            .multiply_with_context(&multiplicand.inner, MathContext::new(precision, rm))
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    pub fn precision(&self) -> u32 {
        self.inner.precision()
    }

    #[napi(js_name = "toString")]
    pub fn to_string_js(&self) -> String {
        self.inner.to_string()
    }

    #[napi]
    pub fn to_engineering_string(&self) -> String {
        self.inner.to_engineering_string()
    }

    #[napi]
    pub fn negate(&self) -> BigDecimal {
        BigDecimal {
            inner: self.inner.negate(),
        }
    }

    #[napi]
    pub fn subtract(&self, subtrahend: &BigDecimal) -> BigDecimal {
        BigDecimal {
            inner: self.inner.subtract(&subtrahend.inner),
        }
    }

    #[napi(js_name = "addWithContext")]
    pub fn add_with_context(
        &self,
        augend: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .add_with_context(&augend.inner, mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "subtractWithContext")]
    pub fn subtract_with_context(
        &self,
        subtrahend: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .subtract_with_context(&subtrahend.inner, mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    pub fn round(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .round(mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    pub fn set_scale(&self, new_scale: i32, rounding_mode: u8) -> Result<BigDecimal> {
        let rm = RoundingMode::from_ordinal(rounding_mode)
            .ok_or_else(|| Error::from_reason("Invalid rounding mode"))?;
        self.inner
            .set_scale(new_scale, rm)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    pub fn compare_to(&self, other: &BigDecimal) -> i32 {
        self.inner.compare_to(&other.inner)
    }

    #[napi]
    pub fn equals(&self, other: &BigDecimal) -> bool {
        self.inner.equals(&other.inner)
    }

    #[napi]
    pub fn max(&self, other: &BigDecimal) -> BigDecimal {
        BigDecimal {
            inner: self.inner.max(&other.inner),
        }
    }

    #[napi]
    pub fn min(&self, other: &BigDecimal) -> BigDecimal {
        BigDecimal {
            inner: self.inner.min(&other.inner),
        }
    }

    /// Exact division (throws on a non-terminating expansion).
    #[napi]
    pub fn divide(&self, divisor: &BigDecimal) -> Result<BigDecimal> {
        self.inner
            .divide_exact(&divisor.inner)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "divideWithScale")]
    pub fn divide_with_scale(
        &self,
        divisor: &BigDecimal,
        scale: i32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let rm = RoundingMode::from_ordinal(rounding_mode)
            .ok_or_else(|| Error::from_reason("Invalid rounding mode"))?;
        self.inner
            .divide_at_scale(&divisor.inner, scale, rm)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "divideWithRounding")]
    pub fn divide_with_rounding(
        &self,
        divisor: &BigDecimal,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let rm = RoundingMode::from_ordinal(rounding_mode)
            .ok_or_else(|| Error::from_reason("Invalid rounding mode"))?;
        self.inner
            .divide_with_rounding(&divisor.inner, rm)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "divideWithContext")]
    pub fn divide_with_context(
        &self,
        divisor: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .divide_with_context(&divisor.inner, mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "divideToIntegralValueWithContext")]
    pub fn divide_to_integral_value_with_context(
        &self,
        divisor: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .divide_to_integral_value_with_context(&divisor.inner, mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "absWithContext")]
    pub fn abs_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .abs_with_context(mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "negateWithContext")]
    pub fn negate_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .negate_with_context(mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "plusWithContext")]
    pub fn plus_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .plus_with_context(mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "powWithContext")]
    pub fn pow_with_context(&self, n: i32, precision: u32, rounding_mode: u8) -> Result<BigDecimal> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .pow_with_context(n, mc)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "movePointLeft")]
    pub fn move_point_left(&self, n: i32) -> Result<BigDecimal> {
        self.inner
            .move_point_left(n)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "movePointRight")]
    pub fn move_point_right(&self, n: i32) -> Result<BigDecimal> {
        self.inner
            .move_point_right(n)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "scaleByPowerOfTen")]
    pub fn scale_by_power_of_ten(&self, n: i32) -> Result<BigDecimal> {
        self.inner
            .scale_by_power_of_ten(n)
            .map(|inner| BigDecimal { inner })
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi]
    pub fn strip_trailing_zeros(&self) -> BigDecimal {
        BigDecimal {
            inner: self.inner.strip_trailing_zeros(),
        }
    }

    #[napi]
    pub fn ulp(&self) -> BigDecimal {
        BigDecimal {
            inner: self.inner.ulp(),
        }
    }

    /// The unscaled value as a decimal string (facade converts to bigint).
    #[napi(js_name = "unscaledValueString")]
    pub fn unscaled_value_string(&self) -> String {
        self.inner.unscaled_value().to_string()
    }

    #[napi(js_name = "toBigIntegerString")]
    pub fn to_big_integer_string(&self) -> Result<String> {
        self.inner
            .to_big_integer()
            .map(|b| b.to_string())
            .map_err(|e| Error::from_reason(e.to_string()))
    }

    #[napi(js_name = "toBigIntegerExactString")]
    pub fn to_big_integer_exact_string(&self) -> Result<String> {
        self.inner
            .to_big_integer_exact()
            .map(|b| b.to_string())
            .map_err(|e| Error::from_reason(e.to_string()))
    }
}

/// Build a `MathContext` from a precision and a Java rounding-mode ordinal.
fn math_context(precision: u32, rounding_mode: u8) -> Result<MathContext> {
    let rm = RoundingMode::from_ordinal(rounding_mode)
        .ok_or_else(|| Error::from_reason("Invalid rounding mode"))?;
    Ok(MathContext::new(precision, rm))
}
