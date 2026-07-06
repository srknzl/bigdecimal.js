//! Idiomatic error types. The core never panics on a domain error and never
//! throws — every fallible operation returns `Result`. Binding layers map these
//! onto the JS exceptions the current API throws (mostly `RangeError`).

use std::fmt;

/// Errors from arithmetic / rounding operations. These mirror the situations in
/// which OpenJDK's BigDecimal throws `ArithmeticException`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ArithmeticError {
    /// Divisor is zero.
    DivisionByZero,
    /// `RoundingMode.UNNECESSARY` was requested but rounding was actually needed.
    InexactResult,
    /// `divide` (or similar) under an unlimited `MathContext` has no exact,
    /// terminating decimal representation.
    NonTerminatingDecimalExpansion,
    /// A resulting scale does not fit in a 32-bit signed integer.
    ScaleOverflow,
    /// `sqrt`/`pow` argument out of the defined domain (e.g. sqrt of a negative).
    Overflow,
}

impl fmt::Display for ArithmeticError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let msg = match self {
            ArithmeticError::DivisionByZero => "Division by zero",
            ArithmeticError::InexactResult => "Rounding necessary",
            ArithmeticError::NonTerminatingDecimalExpansion => {
                "Non-terminating decimal expansion; no exact representable result"
            }
            ArithmeticError::ScaleOverflow => "Scale out of range for a 32-bit integer",
            ArithmeticError::Overflow => "Numeric overflow",
        };
        f.write_str(msg)
    }
}

impl std::error::Error for ArithmeticError {}

/// Errors from constructing a `BigDecimal` from a string.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ParseError {
    /// Input was empty.
    Empty,
    /// Input was not a valid decimal representation.
    Malformed,
    /// The exponent field overflowed a 32-bit integer.
    ExponentOverflow,
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let msg = match self {
            ParseError::Empty => "Empty string is not a valid BigDecimal",
            ParseError::Malformed => "Not a valid BigDecimal string",
            ParseError::ExponentOverflow => "Exponent out of range",
        };
        f.write_str(msg)
    }
}

impl std::error::Error for ParseError {}
