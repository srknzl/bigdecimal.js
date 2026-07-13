# Rounding Modes

When a result can't be represented exactly at the requested scale or precision, a
`RoundingMode` decides how it's rounded. BigDecimal.js implements all eight of Java's
modes, with identical semantics.

```js
import { Big, RoundingMode } from 'bigdecimal.js'

Big('2.345').setScale(2, RoundingMode.HALF_UP)   // '2.35'
Big('2.345').setScale(2, RoundingMode.HALF_EVEN) // '2.34'
Big('2.345').setScale(2, RoundingMode.FLOOR)     // '2.34'
```

## The eight modes at a glance

| Mode | Rounds… | Ties |
| --- | --- | --- |
| `UP` | away from zero | — |
| `DOWN` | toward zero (truncate) | — |
| `CEILING` | toward +∞ | — |
| `FLOOR` | toward −∞ | — |
| `HALF_UP` | to nearest | away from zero |
| `HALF_DOWN` | to nearest | toward zero |
| `HALF_EVEN` | to nearest | to the even neighbor ("banker's") |
| `UNNECESSARY` | asserts exactness | **throws** if rounding is needed |

## Worked table (rounding to an integer)

This is the JDK's canonical table — each input rounded to zero decimal places. Because
correctness here is *defined* as "matches Java", these are exactly the results
BigDecimal.js produces:

| Input | UP | DOWN | CEILING | FLOOR | HALF_UP | HALF_DOWN | HALF_EVEN |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `5.5` | 6 | 5 | 6 | 5 | 6 | 5 | 6 |
| `2.5` | 3 | 2 | 3 | 2 | 3 | 2 | 2 |
| `1.6` | 2 | 1 | 2 | 1 | 2 | 2 | 2 |
| `1.1` | 2 | 1 | 2 | 1 | 1 | 1 | 1 |
| `1.0` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `-1.0` | -1 | -1 | -1 | -1 | -1 | -1 | -1 |
| `-1.1` | -2 | -1 | -1 | -2 | -1 | -1 | -1 |
| `-1.6` | -2 | -1 | -1 | -2 | -2 | -2 | -2 |
| `-2.5` | -3 | -2 | -2 | -3 | -3 | -2 | -2 |
| `-5.5` | -6 | -5 | -5 | -6 | -6 | -5 | -6 |

<Playground :code="`const inputs = ['5.5','2.5','1.6','1.1','-1.6','-2.5']
for (const s of inputs) {
  console.log(
    s.padStart(5),
    'HALF_UP=' + Big(s).setScale(0, RoundingMode.HALF_UP),
    'HALF_EVEN=' + Big(s).setScale(0, RoundingMode.HALF_EVEN),
    'FLOOR=' + Big(s).setScale(0, RoundingMode.FLOOR),
  )
}`" />

## Which one should I use?

- **`HALF_UP`** — what people mean by "round". Good default for display.
- **`HALF_EVEN`** — banker's rounding; removes the systematic upward bias of `HALF_UP`
  over many values. The standard for financial aggregates and the default of IEEE-754.
- **`DOWN` / `FLOOR`** — truncation; e.g. flooring shares of money so you never over-allocate.
- **`UP` / `CEILING`** — e.g. billing that always rounds a partial unit up.
- **`UNNECESSARY`** — a guard: use it when you *expect* the operation to be exact and want a
  thrown error if your assumption is ever wrong.

```js
Big('2.50').setScale(1, RoundingMode.UNNECESSARY).toString() // '2.5'  — already exact
Big('2.55').setScale(1, RoundingMode.UNNECESSARY)            // throws — rounding was needed
```

## Where rounding modes apply

Any operation that can lose precision takes a `RoundingMode` (or a `MathContext`, which
bundles precision + mode):

- `setScale(scale, roundingMode)`
- `divide(divisor, scale, roundingMode)` and `divideWithMathContext(divisor, mc)`
- `round(mc)` — round to a MathContext's precision
- The formatters: `toFixed`, `toExponential`, `toPrecision` (default `HALF_UP`)
