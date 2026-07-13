---
aside: false
outline: false
---

# Playground

Write BigDecimal.js code and run it right here — it executes in your browser against the
actual library build. `Big`, `MC`, `RoundingMode`, `BigDecimal`, and `MathContext` are all
in scope, along with `console`.

The **last expression** is printed automatically; use `console.log(...)` for scripts. Press
**Run** or <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>Enter</kbd>.

<Playground :code="`// Everything is in scope: Big, MC, RoundingMode, BigDecimal, MathContext.
// 1. Exact decimal arithmetic
console.log('0.1 + 0.2 =', Big('0.1').add('0.2').toString())
// 2. Per-operation precision & rounding (no globals)
const third = Big(1).divideWithMathContext(Big(3), MC(15, RoundingMode.HALF_EVEN))
console.log('1/3 =', third.toString())
// 3. Money: full precision, round once at the edge
const total = Big('19.99').multiply(3).multiply('1.0825')
console.log('total =', total.setScale(2, RoundingMode.HALF_UP)
  .toFormat('en-US', { style: 'currency', currency: 'USD' }))
// 4. The last expression is returned & printed:
Big('2').sqrt(MC(30)).toString()`" />

## Things to try

- Change `MC(15, ...)` to `MC(50, ...)` and watch `1/3` extend to 50 digits.
- Swap `RoundingMode.HALF_UP` for `HALF_EVEN`, `FLOOR`, `CEILING` — see [Rounding Modes](/cookbook/rounding).
- Trigger the safety net: `Big('1').divide('3')` throws on a non-terminating result.
- Compare scales: `Big('2.0').equals(Big('2.00'))` vs `Big('2.0').sameValue(Big('2.00'))`.

::: tip Full API
Every method is in the [API Reference](/api/). Common recipes live in the
[Cookbook](/cookbook/avoiding-float-errors).
:::
