# Migrating from bignumber.js

The differences mirror those from decimal.js — bignumber.js shares MikeMcl's API style:

1. **No global config.** Replace `BigNumber.set({ DECIMAL_PLACES, ROUNDING_MODE })` with a
   `MathContext` (`MC`) passed to the operation.
2. **Java method names.** `plus` → `add`, `times` → `multiply`, `comparedTo` → `compareTo`.
3. **`divide` throws on non-terminating results** unless given a scale or MathContext.

## Method equivalents

| bignumber.js | BigDecimal.js |
| --- | --- |
| `BigNumber('1.5')` / `new BigNumber('1.5')` | `Big('1.5')` (with or without `new`) |
| `x.plus(y)` | `x.add(y)` |
| `x.minus(y)` | `x.subtract(y)` |
| `x.times(y)` / `x.multipliedBy(y)` | `x.multiply(y)` |
| `x.div(y)` / `x.dividedBy(y)` | `x.divide(y, scale?, roundingMode?)` |
| `x.mod(y)` | `x.remainder(y)` |
| `x.pow(n)` | `x.pow(n)` |
| `x.sqrt()` | `x.sqrt(mc)` — MathContext required |
| `x.abs()` | `x.abs()` |
| `x.negated()` | `x.negate()` |
| `x.comparedTo(y)` | `x.compareTo(y)` |
| `x.eq(y)` / `x.isEqualTo(y)` | `x.sameValue(y)` (value) or `x.equals(y)` (value + scale) |
| `x.gt(y)` / `x.gte(y)` / `x.lt(y)` / `x.lte(y)` | same names |
| `x.isZero()` / `x.isNegative()` / `x.isPositive()` | same names |
| `x.toNumber()` | `x.numberValue()` |
| `x.toFixed(n)` / `x.toExponential(n)` / `x.toPrecision(n)` | same names |
| `x.toFormat(...)` | `x.toFormat(locales, options)` — `Intl`-based |
| `BigNumber.ROUND_HALF_UP` | `RoundingMode.HALF_UP` |
| `BigNumber.set({ DECIMAL_PLACES: 20 })` | pass `MC(20)` or a scale to the operation |

## `toFormat` is `Intl`-based here

bignumber.js's `toFormat` takes a custom format object. This library's `toFormat` delegates
to the built-in `Intl.NumberFormat`, so you get locale-correct output with no config:

```js
// bignumber.js
new BigNumber('1234.5').toFormat(2) // '1,234.50' (with default FORMAT)

// BigDecimal.js
Big('1234.5').toFormat('en-US')                                          // '1,234.5'
Big('1234.5').toFormat('en-US', { minimumFractionDigits: 2 })            // '1,234.50'
Big('1234.5').toFormat('de-DE', { style: 'currency', currency: 'EUR' })  // '1.234,50 €'
```

See [Formatting Output](../guide/formatting) for the full `Intl` option surface.

## Global rounding → per-call

```js
// bignumber.js
BigNumber.set({ DECIMAL_PLACES: 2, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
new BigNumber(10).div(3) // 3.33

// BigDecimal.js
import { Big, RoundingMode } from 'bigdecimal.js'
Big(10).divide(3, 2, RoundingMode.HALF_UP).toString() // '3.33'
```

<Playground :code="`// Port of: new BigNumber(10).dividedBy(3) with 2 dp, HALF_UP
Big(10).divide(3, 2, RoundingMode.HALF_UP).toString()`" />
