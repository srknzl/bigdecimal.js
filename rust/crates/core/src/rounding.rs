//! Rounding modes, mirroring `java.math.RoundingMode` exactly (same ordinal
//! order, same semantics). The actual rounding *kernel* that consumes these
//! lives with division/scaling in later phases; this phase pins the type.

/// Specifies a rounding policy, identical in meaning to `java.math.RoundingMode`.
/// Discriminants match Java's ordinals so a binding can pass the integer through.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum RoundingMode {
    Up = 0,
    Down = 1,
    Ceiling = 2,
    Floor = 3,
    HalfUp = 4,
    HalfDown = 5,
    HalfEven = 6,
    Unnecessary = 7,
}

impl RoundingMode {
    /// Build from a Java ordinal (0..=7). Returns `None` for out-of-range input.
    pub fn from_ordinal(v: u8) -> Option<RoundingMode> {
        Some(match v {
            0 => RoundingMode::Up,
            1 => RoundingMode::Down,
            2 => RoundingMode::Ceiling,
            3 => RoundingMode::Floor,
            4 => RoundingMode::HalfUp,
            5 => RoundingMode::HalfDown,
            6 => RoundingMode::HalfEven,
            7 => RoundingMode::Unnecessary,
            _ => return None,
        })
    }
}
