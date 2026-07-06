//! `MathContext`: precision + rounding policy, mirroring `java.math.MathContext`.

use crate::rounding::RoundingMode;

/// The context settings that describe precision and rounding for an operation.
/// A `precision` of 0 means "unlimited" (exact), exactly as in Java.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MathContext {
    /// Number of significant digits; 0 means unlimited.
    pub precision: u32,
    pub rounding_mode: RoundingMode,
}

impl MathContext {
    pub const fn new(precision: u32, rounding_mode: RoundingMode) -> MathContext {
        MathContext { precision, rounding_mode }
    }

    /// Unlimited precision, exact arithmetic. Java uses HALF_UP as its (unused) mode.
    pub const UNLIMITED: MathContext = MathContext::new(0, RoundingMode::HalfUp);
    /// IEEE 754R decimal32: 7 digits, HALF_EVEN.
    pub const DECIMAL32: MathContext = MathContext::new(7, RoundingMode::HalfEven);
    /// IEEE 754R decimal64: 16 digits, HALF_EVEN.
    pub const DECIMAL64: MathContext = MathContext::new(16, RoundingMode::HalfEven);
    /// IEEE 754R decimal128: 34 digits, HALF_EVEN.
    pub const DECIMAL128: MathContext = MathContext::new(34, RoundingMode::HalfEven);
}

impl Default for MathContext {
    fn default() -> Self {
        MathContext::UNLIMITED
    }
}
