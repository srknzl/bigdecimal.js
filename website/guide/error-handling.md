# Error Handling

BigDecimal.js throws plain built-in errors — there is no custom error class to import.
The rule is simple:

> **Everywhere Java's `BigDecimal` throws `ArithmeticException` or
> `NumberFormatException`, BigDecimal.js throws a `RangeError`.**

So one `catch` pattern covers every arithmetic failure:

```js-live
try {
    Big('1').divide('3') // infinite decimal expansion, no exact result
} catch (e) {
    console.log(e instanceof RangeError) // true
    console.log(e.message)
}
```

The message text closely follows the JDK's, so if you are porting Java code the
conditions below will look familiar.

## When errors are thrown

### Parsing and construction

`Big(...)` (and `BigDecimal.fromValue`) throws a `RangeError` for:

- strings that are not valid decimal numbers: multiple decimal points or signs, no
  digits, a missing or malformed exponent after `e`/`E`
- an exponent whose **resulting scale** would fall outside the 32-bit integer range.
  Note it is the scale that must fit, not the exponent: `Big('1E+2147483648')` is
  accepted (its scale is `-2147483648`, which fits) while `Big('1E-2147483648')`
  throws, because that scale would be `+2147483648`. This mirrors the JDK, which
  changed in Java 19 so that `Big(x.toString())` always round-trips
- a `number` outside `[-Number.MAX_VALUE, Number.MAX_VALUE]` (`NaN`, `Infinity`)
- invalid argument combinations: passing both `scale` and a `MathContext`, or passing
  `scale` with a non-integer `number`

```js-live
const attempts = ['1.2.3', '4e', '--5', '7e999999999999']
for (const s of attempts) {
    try {
        Big(s)
    } catch (e) {
        console.log(`Big('${s}') → ${e.message}`)
    }
}
```

`MC(...)` (and the `MathContext` constructor) throws a `RangeError` for a negative
precision or an invalid rounding mode.

### Division

- `divide` throws when the exact quotient has an infinite decimal expansion —
  `Non-terminating decimal expansion; no exact representable decimal result.`
  Pass a `MathContext` (`divideWithMathContext`) or a scale + rounding mode to get a
  rounded result instead.
- Any division by zero throws `Division by zero`; `0 ÷ 0` throws `Division undefined`.
- `divideToIntegralValue`/`divideAndRemainder` with a `MathContext` throw
  `Division impossible` when the integer part needs more digits than the requested
  precision.

```js-live
console.log(Big('1').divideWithMathContext('3', MC(10)).toString())

try {
    Big('1').divide('0')
} catch (e) {
    console.log(e.message) // Division by zero
}
```

### `RoundingMode.UNNECESSARY`

`UNNECESSARY` asserts that no rounding will happen. If the operation *would* need to
round, it throws `Rounding necessary` — Java's behavior exactly:

```js-live
console.log(Big('1.25').setScale(1, RoundingMode.HALF_UP).toString()) // '1.3' — rounded

try {
    Big('1.25').setScale(1, RoundingMode.UNNECESSARY)
} catch (e) {
    console.log(e.message) // Rounding necessary
}
```

### Exact conversions

The `*Exact` methods throw instead of silently losing information — a nonzero
fractional part or an out-of-range value is a `RangeError`:

- `numberValueExact()` — value cannot be represented exactly as a JS `number`
- `intValueExact()`, `shortValueExact()`, `byteValueExact()`, `longValueExact()` —
  fractional part, or outside the Java type's range (`Overflow`)
- `toBigIntExact()` / `toBigIntegerExact()` — nonzero fractional part

```js-live
console.log(Big('42.00').intValueExact()) // trailing zeros are fine — the value is integral

try {
    Big('42.5').intValueExact()
} catch (e) {
    console.log(e.message)
}
```

### Scale and precision limits

- Results whose scale would leave the 32-bit integer range throw
  `Scale too high` / `Scale too less` (Java: "Underflow" / "Overflow").
- `pow(n)` requires `|n| ≤ 999999999`, and negative exponents require a positive
  `MathContext` precision — otherwise `Invalid operation`.
- `sqrt` of a negative value throws `Attempted square root of negative BigDecimal`;
  with `UNNECESSARY`, an inexact square root throws.
- `toFixed`/`toExponential`/`toPrecision` validate their arguments
  (non-negative / positive integers) with a `RangeError`, matching how JS `Number`
  methods reject bad arguments.

### Malformed precision and scale

Java types both `precision` and `scale` as `int`, so a fractional or non-finite
value is impossible there. JavaScript has only `number`, so both are validated on
the way in:

- `MC(p)` requires `p` to be an integer in `[0, 2147483647]` — `MC(1.5)`, `MC(NaN)`
  and `MC(Infinity)` throw `MathContext precision must be an integer`, and values
  above the `int` range throw `out of the 32-bit integer range`.
- `Big(value, scale)` requires `scale` to be an integer in the 32-bit range —
  `Big(1n, NaN)` and `Big(1n, 1.5)` throw `Scale must be an integer`.
- The operations that take a scale, exponent or point shift — `divide(d, scale, rm)`,
  `setScale`, `scaleByPowerOfTen`, `movePointLeft`, `movePointRight` — require the
  same. These are `int` parameters in Java, so an out-of-range value cannot be passed
  there at all; passing one here throws `out of the 32-bit integer range` rather than
  producing a value Java could not represent. This is distinct from an *in-range*
  argument whose resulting scale overflows, which still reports `Scale too high` /
  `Scale too less` (see below).

These are rejected at construction rather than at use because a fractional
precision would otherwise reach the digit-stepping reduction loops in `round()`
and `sqrt()`, which can never converge on a non-integer target, and a `NaN` scale
would reach the string layout and produce malformed output such as `'1ENaN'`.

```js-live
try {
    MC(1.5)
} catch (e) {
    console.log(e.message)
}

try {
    Big(1n, NaN)
} catch (e) {
    console.log(e.message)
}
```

## Why `RangeError`?

Java signals arithmetic failure with `ArithmeticException`; JavaScript has no such
class, and `RangeError` ("a value is not in the set or range of allowed values") is
the closest built-in match — it's what `Number.prototype.toFixed` throws for a bad
argument. Using a built-in keeps the zero-dependency promise and works with
`instanceof` across module copies.

::: tip Version note
Before 1.7.0 there was a single exception: `MathContext` threw `TypeError` for an
invalid rounding mode. Since 1.7.0 it throws `RangeError` like every other
validation failure.
:::
