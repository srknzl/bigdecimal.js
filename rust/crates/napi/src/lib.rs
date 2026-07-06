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
}
