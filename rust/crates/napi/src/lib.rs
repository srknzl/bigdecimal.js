//! napi-rs binding: a thin adapter exposing `bigdecimal-core` to Node.
//!
//! This layer knows nothing about the math — it only wraps `core::BigDecimal`,
//! maps `Result::Err` onto JS exceptions, and lets the JS facade own the API
//! ergonomics (union args, aliases). P0 slice: parse / add / string.

use bigdecimal_core::BigDecimal as CoreBigDecimal;
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
}
