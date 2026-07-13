# Migrating from big.js

big.js is the smallest of the three MikeMcl libraries. Moving to BigDecimal.js gives you
the full Java `BigDecimal` surface (all eight rounding modes, engineering strings, `Intl`
formatting) — with these differences:

1. **No global `Big.DP` / `Big.RM`.** big.js reads global decimal-places and rounding-mode
   for `div`/`sqrt`/`round`. Here you pass a scale + `RoundingMode`, or a `MathContext`, per call.
2. **Java method names.** `plus` → `add`, `times` → `multiply`, `cmp` → `compareTo`,
   `neg` → `negate`.
3. **Eight rounding modes**, not four — see [Rounding Modes](../cookbook/rounding).
4. **`divide` throws on non-terminating results** unless given a scale or MathContext.

## Method equivalents

| big.js | BigDecimal.js |
| --- | --- |
| `Big('1.5')` / `new Big('1.5')` | `Big('1.5')` (with or without `new`) |
| `x.plus(y)` | `x.add(y)` |
| `x.minus(y)` | `x.subtract(y)` |
| `x.times(y)` | `x.multiply(y)` |
| `x.div(y)` | `x.divide(y, scale?, roundingMode?)` |
| `x.mod(y)` | `x.remainder(y)` |
| `x.pow(n)` | `x.pow(n)` |
| `x.sqrt()` | `x.sqrt(mc)` — MathContext required |
| `x.abs()` | `x.abs()` |
| `x.neg()` | `x.negate()` |
| `x.round(dp, rm)` | `x.setScale(dp, roundingMode)` or `x.round(mc)` |
| `x.cmp(y)` | `x.compareTo(y)` |
| `x.eq(y)` | `x.sameValue(y)` (value) or `x.equals(y)` (value + scale) |
| `x.gt(y)` / `x.gte(y)` / `x.lt(y)` / `x.lte(y)` | same names |
| `x.toNumber()` | `x.numberValue()` |
| `x.toFixed(n)` / `x.toExponential(n)` / `x.toPrecision(n)` | same names |
| `Big.roundHalfUp` (1) | `RoundingMode.HALF_UP` |
| `Big.roundHalfEven` (2) | `RoundingMode.HALF_EVEN` |
| `Big.DP` / `Big.RM` (globals) | per-call scale + `RoundingMode`, or `MathContext` |

## `round` → `setScale`

big.js `round(dp, rm)` becomes `setScale(dp, roundingMode)`:

```js
// big.js
new Big('2.345').round(2, Big.roundHalfUp) // 2.35

// BigDecimal.js
import { Big, RoundingMode } from 'bigdecimal.js'
Big('2.345').setScale(2, RoundingMode.HALF_UP).toString() // '2.35'
```

## Global DP → explicit division

```js
// big.js
Big.DP = 10
new Big(1).div(3) // 0.3333333333

// BigDecimal.js
Big(1).divide(3, 10, RoundingMode.HALF_UP).toString() // '0.3333333333'
```

## Sign checks

big.js has no `isZero`/`isNegative`; you'd use `cmp(0)` or read `.s`. This library gives you
predicates:

```js
Big('0').isZero()      // true
Big('-3').isNegative() // true
Big('3').isPositive()  // true
Big('-3').signum()     // -1
```

<Playground :code="`// Port of: new Big('2.345').round(2, Big.roundHalfUp)
Big('2.345').setScale(2, RoundingMode.HALF_UP).toString()`" />
