//! wasm-bindgen binding: a thin adapter exposing `bigdecimal-core` to the browser
//! (and any wasm host). It mirrors the napi binding's method surface one-to-one —
//! same names, same string/scalar boundary — so the single JS facade
//! (`src/backend-node.js`) drives either backend unchanged. All the math lives in
//! `bigdecimal-core` (JDK 26 BigDecimal semantics); this layer only marshals values
//! and maps `Result::Err` onto thrown JS errors.

use bigdecimal_core::{BigDecimal as CoreBigDecimal, MathContext, RoundingMode};
use wasm_bindgen::prelude::*;

/// JS-facing handle around a core `BigDecimal`. Unlike napi-rs, wasm-bindgen does
/// not auto-camelCase, so every multi-word method carries an explicit `js_name`
/// matching what the facade calls.
#[wasm_bindgen(js_name = BigDecimal)]
pub struct BigDecimal {
    inner: CoreBigDecimal,
}

#[wasm_bindgen(js_class = BigDecimal)]
impl BigDecimal {
    #[wasm_bindgen(js_name = fromString)]
    pub fn from_string(s: &str) -> Result<BigDecimal, JsError> {
        CoreBigDecimal::from_str(s)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = fromUnscaledScaleContext)]
    pub fn from_unscaled_scale_context(
        unscaled: &str,
        scale: i32,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        CoreBigDecimal::from_unscaled_string(unscaled, scale, mc)
            .map(wrap)
            .map_err(err)
    }

    pub fn sqrt(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.sqrt(mc).map(wrap).map_err(err)
    }

    pub fn add(&self, augend: &BigDecimal) -> BigDecimal {
        wrap(self.inner.add(&augend.inner))
    }

    pub fn scale(&self) -> i32 {
        self.inner.scale()
    }

    pub fn signum(&self) -> i32 {
        self.inner.signum()
    }

    #[wasm_bindgen(js_name = toPlainString)]
    pub fn to_plain_string(&self) -> String {
        self.inner.to_plain_string()
    }

    pub fn multiply(&self, multiplicand: &BigDecimal) -> BigDecimal {
        wrap(self.inner.multiply(&multiplicand.inner))
    }

    #[wasm_bindgen(js_name = multiplyWithContext)]
    pub fn multiply_with_context(
        &self,
        multiplicand: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .multiply_with_context(&multiplicand.inner, mc)
            .map(wrap)
            .map_err(err)
    }

    pub fn precision(&self) -> u32 {
        self.inner.precision()
    }

    #[wasm_bindgen(js_name = toString)]
    pub fn to_string_js(&self) -> String {
        self.inner.to_string()
    }

    #[wasm_bindgen(js_name = toEngineeringString)]
    pub fn to_engineering_string(&self) -> String {
        self.inner.to_engineering_string()
    }

    pub fn negate(&self) -> BigDecimal {
        wrap(self.inner.negate())
    }

    pub fn subtract(&self, subtrahend: &BigDecimal) -> BigDecimal {
        wrap(self.inner.subtract(&subtrahend.inner))
    }

    #[wasm_bindgen(js_name = addWithContext)]
    pub fn add_with_context(
        &self,
        augend: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .add_with_context(&augend.inner, mc)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = subtractWithContext)]
    pub fn subtract_with_context(
        &self,
        subtrahend: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .subtract_with_context(&subtrahend.inner, mc)
            .map(wrap)
            .map_err(err)
    }

    pub fn round(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.round(mc).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = setScale)]
    pub fn set_scale(&self, new_scale: i32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let rm = rounding(rounding_mode)?;
        self.inner.set_scale(new_scale, rm).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = compareTo)]
    pub fn compare_to(&self, other: &BigDecimal) -> i32 {
        self.inner.compare_to(&other.inner)
    }

    pub fn equals(&self, other: &BigDecimal) -> bool {
        self.inner.equals(&other.inner)
    }

    pub fn max(&self, other: &BigDecimal) -> BigDecimal {
        wrap(self.inner.max(&other.inner))
    }

    pub fn min(&self, other: &BigDecimal) -> BigDecimal {
        wrap(self.inner.min(&other.inner))
    }

    pub fn divide(&self, divisor: &BigDecimal) -> Result<BigDecimal, JsError> {
        self.inner.divide_exact(&divisor.inner).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = divideWithScale)]
    pub fn divide_with_scale(
        &self,
        divisor: &BigDecimal,
        scale: i32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let rm = rounding(rounding_mode)?;
        self.inner
            .divide_at_scale(&divisor.inner, scale, rm)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = divideWithRounding)]
    pub fn divide_with_rounding(
        &self,
        divisor: &BigDecimal,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let rm = rounding(rounding_mode)?;
        self.inner
            .divide_with_rounding(&divisor.inner, rm)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = divideWithContext)]
    pub fn divide_with_context(
        &self,
        divisor: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .divide_with_context(&divisor.inner, mc)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = divideToIntegralValueWithContext)]
    pub fn divide_to_integral_value_with_context(
        &self,
        divisor: &BigDecimal,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner
            .divide_to_integral_value_with_context(&divisor.inner, mc)
            .map(wrap)
            .map_err(err)
    }

    #[wasm_bindgen(js_name = absWithContext)]
    pub fn abs_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.abs_with_context(mc).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = negateWithContext)]
    pub fn negate_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.negate_with_context(mc).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = plusWithContext)]
    pub fn plus_with_context(&self, precision: u32, rounding_mode: u8) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.plus_with_context(mc).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = powWithContext)]
    pub fn pow_with_context(
        &self,
        n: i32,
        precision: u32,
        rounding_mode: u8,
    ) -> Result<BigDecimal, JsError> {
        let mc = math_context(precision, rounding_mode)?;
        self.inner.pow_with_context(n, mc).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = movePointLeft)]
    pub fn move_point_left(&self, n: i32) -> Result<BigDecimal, JsError> {
        self.inner.move_point_left(n).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = movePointRight)]
    pub fn move_point_right(&self, n: i32) -> Result<BigDecimal, JsError> {
        self.inner.move_point_right(n).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = scaleByPowerOfTen)]
    pub fn scale_by_power_of_ten(&self, n: i32) -> Result<BigDecimal, JsError> {
        self.inner.scale_by_power_of_ten(n).map(wrap).map_err(err)
    }

    #[wasm_bindgen(js_name = stripTrailingZeros)]
    pub fn strip_trailing_zeros(&self) -> BigDecimal {
        wrap(self.inner.strip_trailing_zeros())
    }

    pub fn ulp(&self) -> BigDecimal {
        wrap(self.inner.ulp())
    }

    #[wasm_bindgen(js_name = numberValue)]
    pub fn number_value(&self) -> f64 {
        self.inner.number_value()
    }

    #[wasm_bindgen(js_name = unscaledValueString)]
    pub fn unscaled_value_string(&self) -> String {
        self.inner.unscaled_value().to_string()
    }

    #[wasm_bindgen(js_name = toBigIntegerString)]
    pub fn to_big_integer_string(&self) -> Result<String, JsError> {
        self.inner
            .to_big_integer()
            .map(|b| b.to_string())
            .map_err(err)
    }

    #[wasm_bindgen(js_name = toBigIntegerExactString)]
    pub fn to_big_integer_exact_string(&self) -> Result<String, JsError> {
        self.inner
            .to_big_integer_exact()
            .map(|b| b.to_string())
            .map_err(err)
    }
}

fn wrap(inner: CoreBigDecimal) -> BigDecimal {
    BigDecimal { inner }
}

/// Map any core error to a thrown JS `Error`; the facade's `guard()` rewraps it
/// as a `RangeError`, matching the napi path.
fn err<E: std::fmt::Display>(e: E) -> JsError {
    JsError::new(&e.to_string())
}

fn rounding(rounding_mode: u8) -> Result<RoundingMode, JsError> {
    RoundingMode::from_ordinal(rounding_mode)
        .ok_or_else(|| JsError::new("Invalid rounding mode"))
}

/// Build a `MathContext` from a precision and a Java rounding-mode ordinal.
fn math_context(precision: u32, rounding_mode: u8) -> Result<MathContext, JsError> {
    Ok(MathContext::new(precision, rounding(rounding_mode)?))
}
