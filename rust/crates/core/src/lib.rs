//! `bigdecimal-core`: a pure Rust reimplementation of the OpenJDK
//! `java.math.BigDecimal` semantics.
//!
//! This crate is **binding-agnostic**: it has no dependency on and no knowledge
//! of napi-rs, wasm-bindgen, Node, or the browser. Binding crates depend on it
//! and adapt this API to their host. The public API here is `Result`-based and
//! never panics on a domain error.

mod context;
mod decimal;
mod error;
mod rounding;

pub use context::MathContext;
pub use decimal::BigDecimal;
pub use error::{ArithmeticError, ParseError};
pub use rounding::RoundingMode;
