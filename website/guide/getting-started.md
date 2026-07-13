# Getting Started

BigDecimal.js is an arbitrary-precision decimal library for JavaScript and TypeScript,
built on native [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).
It is a faithful port of Java's [`BigDecimal`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html):
method names and arithmetic semantics mirror the JDK, so results are exact and predictable.

## Why BigDecimal?

JavaScript numbers are IEEE-754 doubles. They cannot represent most decimal fractions
exactly, which is why money, tax, and measurement math quietly drift:

```js
0.1 + 0.2        // 0.30000000000000004
0.3 - 0.1        // 0.19999999999999998
(0.1 * 3)        // 0.30000000000000004
```

BigDecimal stores the exact value as an integer significand times a power of ten, so
none of that rounding happens until *you* ask for it.

## Install

::: code-group

```sh [npm]
npm install bigdecimal.js
```

```sh [yarn]
yarn add bigdecimal.js
```

```sh [pnpm]
pnpm add bigdecimal.js
```

:::

No polyfills or build config needed — see [Installation](./installation) for Node.js,
bundler, and browser/CDN setups.

## Your first BigDecimal

Everything starts with the `Big` factory. It is callable **with or without `new`** and
accepts a `string`, `number`, `bigint`, or another `BigDecimal`:

```js
import { Big } from 'bigdecimal.js'

const x = Big('1.1111111111111111111111') // from a string (recommended, always exact)
const y = new Big(x)                       // clone — `new` is optional

const z = x.add(y)
z.toString() // '2.2222222222222222222222'

Big(1.1).toString() // '1.1'  — from a number
Big(2n).toString()  // '2'    — from a bigint
```

::: tip Prefer strings for literals
`Big(0.1)` works, but the `0.1` was *already* an imprecise double before BigDecimal saw
it. `Big('0.1')` parses the exact decimal you wrote. For non-integer literals, quote them.
:::

Try it — this runs in your browser:

<Playground :code="`const subtotal = Big('19.99')
const taxRate  = Big('0.085')
const tax   = subtotal.multiply(taxRate)
const total = subtotal.add(tax)
console.log('tax:  ', tax.toString())
console.log('total:', total.toString())
total.setScale(2, RoundingMode.HALF_UP).toString()`" />

## Precision & rounding

BigDecimal has **no global configuration**. Instead of a mutable `Decimal.set({ ... })`,
you pass a [`MathContext`](../api/) (via the `MC` factory) to the operation that needs it:

```js
import { Big, MC, RoundingMode } from 'bigdecimal.js'

const x = Big('1')
const y = Big('3')

x.divideWithMathContext(y, MC(3)).toString()                    // '0.333'
x.divideWithMathContext(y, MC(3, RoundingMode.UP)).toString()   // '0.334'
```

`MC(precision, roundingMode?)` sets the number of significant digits and how ties break
(defaults to `HALF_UP`). See [Core Concepts](./core-concepts) for scale vs. precision and
the full list of [rounding modes](../cookbook/rounding).

## `divide` throws on non-terminating results

A design choice inherited from Java: an *exact* division that cannot be represented in a
finite number of digits throws, rather than silently rounding.

```js
try {
  Big('1').divide(Big('3')) // 0.3333… never terminates
} catch (e) {
  e.message // 'Non-terminating decimal expansion; no exact representable decimal result.'
}

// Ask for a rounded result explicitly, either way works:
Big('1').divide(Big('3'), 5, RoundingMode.HALF_UP).toString() // '0.33333'
Big('1').divideWithMathContext(Big('3'), MC(5)).toString()    // '0.33333'
```

This surfaces precision bugs at the call site instead of shipping them to production.

## Next steps

- [Installation](./installation) — Node.js, bundlers, and browser/CDN
- [Core Concepts](./core-concepts) — immutability, scale, precision, MathContext
- [Formatting Output](./formatting) — `toFixed`, `toFormat`, locale/currency
- [Playground](/playground) — experiment with the full API live
