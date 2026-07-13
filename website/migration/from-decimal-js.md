# Migrating from decimal.js

BigDecimal.js models Java's `BigDecimal`, so the API differs from decimal.js in three
ways worth understanding before you port code:

1. **No global config.** decimal.js has `Decimal.set({ precision, rounding })`. Here,
   precision and rounding are passed **per operation** via `MathContext` (`MC`) and
   `RoundingMode` — nothing is global or mutable.
2. **Java method names.** `plus` → `add`, `times` → `multiply`, `cmp` → `compareTo`, etc.
3. **`divide` throws on non-terminating results** unless you pass a scale or MathContext.

## Method equivalents

| decimal.js | BigDecimal.js |
| --- | --- |
| `new Decimal('1.5')` | `Big('1.5')` (with or without `new`) |
| `x.plus(y)` | `x.add(y)` |
| `x.minus(y)` | `x.subtract(y)` |
| `x.times(y)` | `x.multiply(y)` |
| `x.div(y)` | `x.divide(y, scale?, roundingMode?)` — see below |
| `x.mod(y)` | `x.remainder(y)` |
| `x.pow(n)` | `x.pow(n)` |
| `x.sqrt()` | `x.sqrt(mc)` — a MathContext is required |
| `x.abs()` | `x.abs()` |
| `x.neg()` | `x.negate()` |
| `x.cmp(y)` | `x.compareTo(y)` |
| `x.eq(y)` | `x.equals(y)` (value **and** scale) or `x.sameValue(y)` (value only) |
| `x.gt(y)` / `x.gte(y)` / `x.lt(y)` / `x.lte(y)` | same names |
| `x.isZero()` / `x.isNeg()` / `x.isPos()` | `x.isZero()` / `x.isNegative()` / `x.isPositive()` |
| `x.toNumber()` | `x.numberValue()` |
| `x.toFixed(n)` / `x.toExponential(n)` / `x.toPrecision(n)` | same names |
| `Decimal.ROUND_HALF_UP` | `RoundingMode.HALF_UP` |
| `Decimal.set({ precision: 20 })` | pass `MC(20)` to the operation |

## Global precision → MathContext

```js
// decimal.js
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })
const r = new Decimal(1).div(3) // 0.33333333333333333333

// BigDecimal.js — precision travels with the call
import { Big, MC, RoundingMode } from 'bigdecimal.js'
const r = Big(1).divideWithMathContext(Big(3), MC(20, RoundingMode.HALF_UP))
r.toString() // '0.33333333333333333333'
```

## Division

decimal.js `div` always returns a result rounded to the global precision. Here you make the
intent explicit:

```js
// Exact, terminating — no rounding needed
Big('1').divide('4').toString() // '0.25'

// Non-terminating — choose a scale + mode, OR a MathContext
Big('1').divide('3', 20, RoundingMode.HALF_UP).toString()      // scale-based
Big('1').divideWithMathContext('3', MC(20)).toString()          // precision-based

// Without either, it throws — surfacing the precision decision at the call site
Big('1').divide('3') // RangeError: Non-terminating decimal expansion
```

## `eq` has two forms here

decimal.js `eq` compares by value. This library distinguishes value-and-scale equality
from value-only equality (a Java trait):

```js
Big('2.0').equals(Big('2.00'))    // false — scale differs
Big('2.0').sameValue(Big('2.00')) // true  — decimal.js's eq() behaves like this
Big('2.0').compareTo(Big('2.00')) // 0
```

<Playground :code="`// Port of: new Decimal(0.1).plus(0.2).toString()
Big('0.1').add('0.2').toString()`" />
