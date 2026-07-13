---
layout: home

hero:
  name: BigDecimal.js
  text: Exact decimals for JavaScript
  tagline: Arbitrary-precision arithmetic on native BigInt. A faithful port of Java's BigDecimal — fast, correct, and zero-dependency.
  image:
    src: /logo.svg
    alt: BigDecimal.js
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try the Playground →
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/srknzl/bigdecimal.js

features:
  - icon: ⚡
    title: Fastest of the pack
    details: Built on native BigInt — the fastest in 23 of 27 benchmarked operations against big.js, bignumber.js and decimal.js.
    link: https://github.com/srknzl/bigdecimal.js#benchmark-results
    linkText: See the benchmarks
  - icon: 🎯
    title: Exact & Java-faithful
    details: Names and arithmetic mirror java.math.BigDecimal. No hidden precision loss — 0.1 + 0.2 is exactly 0.3.
  - icon: 🌳
    title: Zero dependencies
    details: Pure JavaScript on native BigInt. Runs in Node.js and every modern browser with no polyfills, no config, no globals.
  - icon: 🧪
    title: Differentially tested
    details: Correctness is defined as “matches the JDK.” Every release is checked against a Java oracle and weekly fuzzed against it.
---

## See for yourself

The classic floating-point trap — and how BigDecimal.js makes it go away. Edit the
code and press **Run** (it executes right here in your browser, no install):

<Playground :code="`// Native floats lie:
console.log(0.1 + 0.2)            // 0.30000000000000004
// BigDecimal is exact:
Big('0.1').add('0.2').toString()  // '0.3'`" />

## Quickstart

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

```js
import { Big, MC, RoundingMode } from 'bigdecimal.js'

const price = Big('19.99')
const qty = Big(3)
price.multiply(qty).toString() // '59.97'

// Precision & rounding are per-operation — no global state:
Big('1').divideWithMathContext(Big('3'), MC(5, RoundingMode.HALF_UP)).toString() // '0.33333'
```

<div style="text-align:center; margin-top: 3rem;">

[Read the guide →](/guide/getting-started) · [Migrating from another library? →](/migration/from-decimal-js)

</div>
