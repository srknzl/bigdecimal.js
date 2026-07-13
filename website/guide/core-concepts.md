# Core Concepts

A handful of ideas explain almost everything about how BigDecimal.js behaves. They all
come straight from Java's `BigDecimal`.

## A value is `unscaledValue × 10⁻ˢᶜᵃˡᵉ`

Every BigDecimal is an integer **unscaled value** paired with a non-negative-or-negative
integer **scale**:

```js
const x = Big('12.345')
x.unscaledValue() // 12345n
x.scale()         // 3   →  12345 × 10⁻³ = 12.345
```

This is why the library is exact: there is no binary fraction anywhere, just a big integer
and a power of ten.

## Values are immutable

Every operation returns a **new** BigDecimal; the original is never modified. Chain freely
and share instances without fear of aliasing bugs:

```js-live
const a = Big('10')
const b = a.add(5)                 // a is still 10
console.log('a =', a.toString())   // '10'
console.log('b =', b.toString())   // '15'
```

## Scale is significant — trailing zeros are preserved

`2.0` and `2.00` are the *same number* but have different **scale** (1 vs 2). BigDecimal
keeps that distinction, which matters for money (`$2.00`, not `$2`) and mirrors Java:

```js-live
console.log(Big('2.0').scale())  // 1
console.log(Big('2.00').scale()) // 2

// Arithmetic scale follows Java's rules:
console.log(Big('1.0').add('2.00').toString())     // '3.00' (max of the two scales)
console.log(Big('1.5').multiply('1.5').toString()) // '2.25' (sum of the scales)
```

Use [`stripTrailingZeros()`](../api/) to drop them, and [`setScale()`](../api/) to force a
specific number of fraction digits.

## `equals` vs `compareTo` vs `sameValue`

Because scale is significant, there are two distinct notions of "equal", again matching
Java. This is the single most common surprise, so it's worth memorizing:

```js
Big('2.0').equals(Big('2.00'))    // false — value AND scale must match
Big('2.0').sameValue(Big('2.00')) // true  — numeric value only
Big('2.0').compareTo(Big('2.00')) // 0     — 0 means equal in value (use for sorting)
```

- **`compareTo(y)`** → `-1 | 0 | 1`; the numeric comparison. Also exposed as
  `lt` / `lte` / `gt` / `gte`.
- **`sameValue(y)`** → `true` when values are numerically equal, ignoring scale.
- **`equals(y)`** → `true` only when value *and* scale match. Use it when scale is part of
  your identity; otherwise reach for `compareTo`/`sameValue`.

<Playground :code="`const a = Big('2.0'), b = Big('2.00')
console.log('equals   ', a.equals(b))
console.log('sameValue', a.sameValue(b))
console.log('compareTo', a.compareTo(b))`" />

## Precision & MathContext — no globals

**Precision** is the count of significant digits. Unlike decimal.js/bignumber.js there is
no global `set({ precision })`; you pass a `MathContext` to the specific operation:

```js
import { Big, MC, RoundingMode } from 'bigdecimal.js'

Big('1').divideWithMathContext(Big('3'), MC(5)).toString() // '0.33333'
```

`MC(precision, roundingMode = HALF_UP)` builds a MathContext. There are also Java's
presets on the class: `MathContext.DECIMAL32`, `DECIMAL64`, `DECIMAL128`, and `UNLIMITED`.

This design means one part of your program can never change another part's rounding
behavior — a frequent source of bugs in globally-configured libraries.

## Rounding modes

When a result can't be represented exactly at the requested scale/precision, a
`RoundingMode` decides how to round. All eight Java modes are available:

`UP`, `DOWN`, `CEILING`, `FLOOR`, `HALF_UP`, `HALF_DOWN`, `HALF_EVEN`, `UNNECESSARY`.

`UNNECESSARY` asserts the operation is exact and **throws** if it isn't. See the
[Rounding Modes cookbook](../cookbook/rounding) for a side-by-side of what each does.

## Exact division throws

`divide(y)` with no scale/context computes an *exact* quotient — and throws a `RangeError`
if that quotient doesn't terminate:

```js-live
console.log(Big('1').divide(Big('4')).toString())  // '0.25' — terminates, fine
Big('1').divide(Big('3'))  // throws RangeError — 0.333… never terminates
```

Provide a scale or a MathContext to get a rounded result. This makes precision loss loud
instead of silent. See [Getting Started](./getting-started#divide-throws-on-non-terminating-results).

## Compact fast path (why it's fast)

Internally, when a significand fits in a safe integer (≤ 15 digits) BigDecimal keeps it as
a plain `number` and only "inflates" to `BigInt` when it must. You never see this — it's
purely a performance detail — but it's why the library outruns the alternatives on typical,
human-sized numbers.
