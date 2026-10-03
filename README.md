# BigDecimal.js

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![codecov](https://codecov.io/gh/srknzl/bigdecimal.js/branch/main/graph/badge.svg?token=Y9PL8TFV2L)](https://codecov.io/gh/srknzl/bigdecimal.js)

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal implementation for Node.js 18 and above, and for browsers that support native `BigInt` (Chrome 67+, Firefox 68+, Safari 14+).
This implementation is inspired from java BigDecimal class. It's fastest on 35 of the 38 comparable operations
against popular BigDecimal libraries — see [benchmark results below](https://github.com/srknzl/bigdecimal.js#benchmark-results) for the full breakdown.

## 📖 Documentation & Playground

**[srknzl.github.io/bigdecimal.js](https://srknzl.github.io/bigdecimal.js/)** — full docs
with guides, a cookbook, migration guides, an API reference, and a **live in-browser
[Playground](https://srknzl.github.io/bigdecimal.js/playground)** where you can run the
library with no install.

- [Getting Started](https://srknzl.github.io/bigdecimal.js/guide/getting-started) · [Installation (Node & browser)](https://srknzl.github.io/bigdecimal.js/guide/installation) · [Core Concepts](https://srknzl.github.io/bigdecimal.js/guide/core-concepts)
- Cookbook: [Avoiding float errors](https://srknzl.github.io/bigdecimal.js/cookbook/avoiding-float-errors) · [Money & currency](https://srknzl.github.io/bigdecimal.js/cookbook/money-currency) · [Rounding modes](https://srknzl.github.io/bigdecimal.js/cookbook/rounding)
- Migrating from [decimal.js](https://srknzl.github.io/bigdecimal.js/migration/from-decimal-js) · [bignumber.js](https://srknzl.github.io/bigdecimal.js/migration/from-bignumber-js) · [big.js](https://srknzl.github.io/bigdecimal.js/migration/from-big-js) · [Java](https://srknzl.github.io/bigdecimal.js/migration/from-java)

## Advantages of this library

* Faster than other BigDecimal libraries because of native BigInt
* Simple API that is almost same with Java's [BigDecimal](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/math/BigDecimal.html)
* No dependencies
* Well tested
* Includes type definition file

## Disadvantages

* This library's minified version is about 5 times larger than big.js's minified version. So the library is not small. 

## Installation

```
npm install bigdecimal.js
```

## Usage

* The example usage is given below:

```javascript
// Single unified constructor for multiple values
const { Big } = require('bigdecimal.js');

// Construct from a string and clone it
const x = Big('1.1111111111111111111111');
const y = new Big(x); // you can also use 'new'

const z = x.add(y);
console.log(z.toString()); // 2.2222222222222222222222

// You can also construct from a number or BigInt:
const u = Big(1.1);
const v = Big(2n);

console.log(u.toString()); // 1.1
console.log(v.toString()); // 2
```

You can use MathContext to set precision and rounding mode for a specific operation:

```javascript
const { Big, MC, RoundingMode } = require('bigdecimal.js');

const x = Big('1');
const y = Big('3');

// MC is MathContext constructor that can be used with or without `new`
const res1 = x.divideWithMathContext(y, MC(3)); 
console.log(res1.toString()); // 0.333

const res2 = x.divideWithMathContext(y, new MC(3, RoundingMode.UP));
console.log(res2.toString()); // 0.334

try {
    x.divide(y);
    // throws since full precision is requested but it is not possible
} catch (e) {
    console.log(e); // RangeError: Non-terminating decimal expansion; no exact representable decimal result.
}
```

## Formatting output

Besides the Java-style `toString` / `toEngineeringString` / `toPlainString`, there
are JS-convention formatting methods. All rounding defaults to `RoundingMode.HALF_UP`
and takes an optional `RoundingMode` argument:

```javascript
const { Big } = require('bigdecimal.js');
const x = Big('1234.56789');

x.toFixed(2);        // "1234.57"   — exactly N decimals, never exponential
x.toExponential(2);  // "1.23e+3"   — JS exponential notation
x.toPrecision(3);    // "1.23e+3"   — N significant digits (fixed or exponential)

// Locale-aware formatting via the built-in Intl.NumberFormat (no dependency):
x.toFormat('en-US');                                        // "1,234.56789"
x.toFormat('de-DE');                                        // "1.234,56789"
Big('1234.5').toFormat('en-US', { style: 'currency', currency: 'USD' }); // "$1,234.50"

// Value coercion (Symbol.toPrimitive): string contexts are exact, numeric ones are lossy
`${x}`;   // "1234.56789"  (exact — same as toString())
+x;       // 1234.56789    (lossy numberValue(), like other JS number coercion)
```

> `toFormat` passes the value to `Intl.NumberFormat` as a string, so integer
> precision is preserved; full-precision string formatting needs Node ≥ 20 or a
> current browser (older engines fall back to double precision past 15–17
> significant digits). By default it shows every decimal the value has (Intl otherwise
> caps at 3), except for `currency`/`percent` styles where Intl's own rules apply.
> Anything you pass in `options` overrides these defaults.

## Migrating from decimal.js / bignumber.js / big.js

The API mirrors Java's `BigDecimal`, so method names differ from other JS decimal
libraries. Common equivalents:

| decimal.js / bignumber.js | bigdecimal.js |
|---|---|
| `new Decimal('1.5')` / `BigNumber('1.5')` | `Big('1.5')` (with or without `new`) |
| `x.plus(y)` / `x.minus(y)` | `x.add(y)` / `x.subtract(y)` |
| `x.times(y)` / `x.div(y)` | `x.multiply(y)` / `x.divide(y, scale?, roundingMode?)` |
| `x.mod(y)` / `x.pow(n)` | `x.remainder(y)` / `x.pow(n)` |
| `x.abs()` / `x.neg()` / `x.sqrt()` | `x.abs()` / `x.negate()` / `x.sqrt(mc)` |
| `x.cmp(y)` / `x.eq(y)` | `x.compareTo(y)` / `x.equals(y)` |
| `x.gt(y)` / `x.gte(y)` / `x.lt(y)` / `x.lte(y)` | same names (`gt`/`gte`/`lt`/`lte`) |
| `x.isZero()` / `x.isNeg()` / `x.isPos()` | `x.isZero()` / `x.isNegative()` / `x.isPositive()` |
| `x.toNumber()` | `x.numberValue()` |
| `x.toFixed(n)` / `x.toExponential(n)` / `x.toPrecision(n)` | same names |
| `x.toFormat(...)` (bignumber.js) | `x.toFormat(locales, options)` (Intl-based) |
| `Decimal.ROUND_HALF_UP` | `RoundingMode.HALF_UP` |

Two differences to note: there is **no global config** — precision and rounding
are set per operation via `MathContext` (`MC`) and `RoundingMode` — and `divide`
**throws** a `RangeError` on a non-terminating result unless you pass a scale or a
`MathContext` (use `divideWithMathContext` for the latter).

## Lossless JSON

JSON is the weak spot of every decimal library: `JSON.parse` rounds numbers to
IEEE-754 doubles *before* your code runs, and `JSON.stringify` turns a
`BigDecimal` into a string (via `toJSON()`), which changes the wire type for
consumers expecting a JSON number (Java's Jackson serializes `BigDecimal` as a
bare number by default, OpenAPI `number` schemas, etc.).

Modern engines (Node.js ≥ 21, Chrome ≥ 114) fix both directions:

```javascript
const { Big, BigDecimal } = require('bigdecimal.js');

// Parse losslessly: context.source is the exact number text from the input.
const order = JSON.parse('{"price":0.1000000000000000000001}', (key, value, context) =>
    typeof value === 'number' && context ? Big(context.source) : value);
order.price.toString(); // '0.1000000000000000000001' — nothing rounded

// Stringify as a bare JSON number with full precision. Must be a regular
// function reading this[key]: JSON.stringify calls toJSON() *before* the
// replacer, so `value` is already a string at this point.
function decimalReplacer(key, value) {
    return this[key] instanceof BigDecimal ? JSON.rawJSON(this[key].toString()) : value;
}
JSON.stringify({ price: Big('0.10') }, decimalReplacer); // '{"price":0.10}'
```

`toString()` output is always valid JSON number syntax, so the replacer is safe
for every value. In real payloads, scope the reviver to known keys — the one
above converts every number in the document. Feature-detect with
`typeof JSON.rawJSON === 'function'`; on older engines the default behavior
(serialize as a JSON string) still round-trips exactly, just as a string.

## Browser usage

The library is pure JavaScript with zero runtime dependencies and uses native `BigInt`, so it runs in the browser with no polyfills. The only requirement is a browser with `BigInt` support (Chrome 67+, Firefox 68+, Safari 14+).

With a bundler (Vite, webpack, esbuild, Rollup) just import it as usual:

```javascript
import { Big } from 'bigdecimal.js';
```

Without a bundler, import the ESM build straight from a CDN:

```html
<script type="module">
  import { Big } from 'https://esm.sh/bigdecimal.js';
  console.log(Big('0.1').add(Big('0.2')).toString()); // 0.3
</script>
```

Or use the minified UMD bundle, which exposes a global `BigDecimalJS`:

```html
<script src="https://cdn.jsdelivr.net/npm/bigdecimal.js/lib/bigdecimal.umd.min.js"></script>
<script>
  const { Big } = BigDecimalJS;
  console.log(Big('0.1').add(Big('0.2')).toString()); // 0.3
</script>
```

## Documentation

* [Documentation site](https://srknzl.github.io/bigdecimal.js/) — guides, cookbook, migration, and the Playground
* [API Reference](https://srknzl.github.io/bigdecimal.js/api/)
* [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## Testing

* Install dependencies: `npm i`
* Compile: `npm run compile`
* Run tests: `npm test`

## Running Benchmarks

There is a benchmark suite that compares

* This library
* [big.js](https://github.com/MikeMcl/big.js)
* [bigdecimal](https://github.com/iriscouch/bigdecimal.js)
* [bignumber.js](https://github.com/MikeMcl/bignumber.js)
* [decimal.js](https://github.com/MikeMcl/decimal.js)

To run the benchmark run `npm install` and then `npm run benchmark`.

## Benchmark Results

Benchmarked against [big.js](https://www.npmjs.com/package/big.js), [bigdecimal](https://www.npmjs.com/package/bigdecimal) (GWT-based), [bignumber.js](https://www.npmjs.com/package/bignumber.js) and [decimal.js](https://www.npmjs.com/package/decimal.js), across 42 operations.

**bigdecimal.js is fastest on 35 of the 38 rows where a winner can be fairly declared** (4 rows compare libraries doing different work — no winner, see footnotes) — often by a wide margin: 4.2× on `multiply`, 25× on `pow`, 100×+ on `ulp`/`stripTrailingZeros`/`movePointLeft`/`movePointRight`. The only rows it loses are `round` and `setScale`, where big.js's digit-array representation makes truncation nearly free — a representational gap, not a missed optimization (see [Performance notes](https://srknzl.github.io/bigdecimal.js/guide/performance)). On both `setScale` rows bignumber.js also edges ahead of it (1.1–1.4×), so bigdecimal.js places third there. It performs best in absolute terms on the **money** cohort below — plain two-decimal-place currency arithmetic, the most realistic workload.

<details>
<summary>Methodology, test machine, and library versions</summary>

* Test Machine:
  * AMD Ryzen 7 9800X3D
  * 32 GB Ram
  * Windows 11
  * Node.js 24
* Update Date: October 3rd 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.7.2
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers. Rows whose cost depends on their argument (`Round`, `SetScale`, `MovePointLeft`/`Right`, `ScaleByPowerOfTen`) cycle through a range of arguments rather than a single hard-coded one.
* Before timing, the harness verifies that every library computes the **same result** for each operation — every result in the batch, not a sample — and runs that check in a **separate process**, so stringifying results to compare them cannot warm the lazy caches the suite is about to measure.
* **A winner is only declared for rows that are actually a like-for-like race.** If the libraries disagree on the result, work to different precision bases, implement different semantics, or only one of them implements the operation at all, the row reports its rates with no trophy. Margins are claimed only when the winner's measured error interval clears the runner-up's; otherwise the row reads *within noise*. Raw machine-readable results are written to `benchmarks/results.json`.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

</details>

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor (from string) | **7,487,113** | 5,484,188 | 3,061,809 | 3,158,575 | 300,407 | 🏆 **Bigdecimal.js** (1.4x) |
| Constructor (from number) | 8,079,063 | 6,473,851 | 3,863,606 | 4,546,290 | 278,513 | not comparable &sup2; |
| Add | **17,583,776** | 6,029,913 | 14,155,772 | 7,773,736 | 41,326 | 🏆 **Bigdecimal.js** (1.2x) |
| Subtract | **18,027,366** | 4,708,853 | 13,040,833 | 7,608,010 | 39,066 | 🏆 **Bigdecimal.js** (1.4x) |
| Multiply | **33,152,490** | 1,875,172 | 7,979,261 | 6,371,519 | 144,940 | 🏆 **Bigdecimal.js** (4.2x) |
| Divide (50 significant digits) | **2,431,804** |  -  |  -  | 1,024,169 | 38,069 | 🏆 **Bigdecimal.js** (2.4x) |
| Divide (50 decimal places) | **3,749,938** | 53,813 | 729,614 |  -  |  -  | 🏆 **Bigdecimal.js** (5.1x) |
| DivideToIntegralValue | **8,235,288** |  -  | 1,217,816 | 2,716,005 | 77,292 | 🏆 **Bigdecimal.js** (3.0x) |
| Remainder | **4,954,340** | 514,958 | 911,512 | 1,642,200 | 106,240 | 🏆 **Bigdecimal.js** (3.0x) |
| Positive pow | **9,232,863** | 29,537 | 363,849 | 285,116 | 5,847 | 🏆 **Bigdecimal.js** (25.4x) |
| Negative pow | 674,803 | 9,851 | 163,297 | 335,881 | 18,044 | not comparable &sup2; |
| Sqrt | 238,393 | 2,383 | 93,198 | 132,570 |  -  | not comparable &#8309; |
| Abs | **270,020,743** | 110,479,848 | 61,058,714 | 20,494,251 | 717,122 | 🏆 **Bigdecimal.js** (2.4x) |
| Negate | **191,104,291** | 108,342,296 | 58,071,089 | 21,347,854 | 373,595 | 🏆 **Bigdecimal.js** (1.8x) |
| Round | 8,591,981 | **32,513,979** |  -  | 8,211,410 | 277,464 | 🏆 **Big.js** (3.8x) |
| SetScale | 13,280,074 | **31,516,996** | 15,144,208 | 9,949,456 | 86,233 | 🏆 **Big.js** (2.1x) |
| SetScale (negative scales) | 9,118,092 | **21,819,318** | 12,650,055 |  -  | 118,991 | 🏆 **Big.js** (1.7x) |
| Compare | **146,670,516** | 77,374,860 | 55,137,338 | 23,616,801 | 57,237,918 | 🏆 **Bigdecimal.js** (1.9x) |
| Equals | 476,744,992 | 77,206,038 | 54,673,784 | 23,458,207 | 84,221,382 | not comparable &#8308; |
| Min | **125,450,999** |  -  | 27,961,333 | 8,654,555 | 1,487,119 | 🏆 **Bigdecimal.js** (4.5x) |
| Max | **127,140,102** |  -  | 26,969,628 | 8,597,466 | 1,236,902 | 🏆 **Bigdecimal.js** (4.7x) |
| MovePointLeft | **50,756,795** |  -  |  -  |  -  | 97,223 | 🏆 **Bigdecimal.js** (522.1x) |
| MovePointRight | **58,165,818** |  -  |  -  |  -  | 94,965 | 🏆 **Bigdecimal.js** (612.5x) |
| ScaleByPowerOfTen | **195,203,953** |  -  | 2,422,538 |  -  | 371,427 | 🏆 **Bigdecimal.js** (80.6x) |
| StripTrailingZeros | **32,464,104** |  -  |  -  |  -  | 316,227 | 🏆 **Bigdecimal.js** (102.7x) |
| Ulp | **315,514,339** |  -  |  -  |  -  | 1,928,991 | 🏆 **Bigdecimal.js** (163.6x) |
| UnscaledValue | **158,380,452** |  -  |  -  |  -  | 477,148 | 🏆 **Bigdecimal.js** (331.9x) |
| ToString | **594,842,602** | 5,586,469 | 11,547,530 | 14,016,076 | 67,201,324 | 🏆 **Bigdecimal.js** (8.9x) &#8310; |
| NumberValue | **38,483,251** | 3,727,015 | 6,438,659 | 5,419,444 | 14,907,963 | 🏆 **Bigdecimal.js** (2.6x) |
| ToBigInt | **11,502,263** |  -  |  -  |  -  | 116,046 | 🏆 **Bigdecimal.js** (99.1x) |

&sup2; Libraries did not agree on the result, so rates are not a like-for-like comparison.
&#8308; The libraries implement different semantics here, so equal rates would not mean equal work.
&#8309; Precision basis differs between libraries (significant digits vs decimal places), so they are not doing equal work.
&#8310; ToString: bigdecimal.js memoises toString per instance; repeated calls on the same value read a warm cache.

### Workload cohorts

bigdecimal.js keeps a significand of up to 15 digits in a plain `number` (the *compact* path) and only inflates to `BigInt` beyond that. The blended table above mixes both, so it reports neither regime cleanly. The **money** cohort is ordinary currency arithmetic — two decimal places, magnitudes under 1e9 — which is what most callers actually run:

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Add (compact) | **46,037,929** | 18,922,587 | 7,046,394 | 8,818,984 | 644,345 | 🏆 **Bigdecimal.js** (2.4x) |
| Subtract (compact) | **55,903,445** | 17,677,555 | 7,420,119 | 9,196,830 | 655,110 | 🏆 **Bigdecimal.js** (3.2x) |
| Multiply (compact) | **70,547,585** | 14,082,737 | 7,030,199 | 10,555,156 | 587,727 | 🏆 **Bigdecimal.js** (5.0x) |
| Compare (compact) | **129,839,474** | 82,676,443 | 48,058,472 | 25,671,721 | 17,201,551 | 🏆 **Bigdecimal.js** (1.6x) |
| Add (inflated) | **15,921,148** | 2,807,491 | 5,168,534 | 7,247,178 | 20,489 | 🏆 **Bigdecimal.js** (2.2x) |
| Subtract (inflated) | **15,547,921** | 2,268,513 | 5,063,127 | 6,838,648 | 19,442 | 🏆 **Bigdecimal.js** (2.3x) |
| Multiply (inflated) | **33,391,434** | 551,700 | 3,296,263 | 3,543,292 | 70,665 | 🏆 **Bigdecimal.js** (9.4x) |
| Compare (inflated) | **110,255,132** | 68,851,371 | 48,591,102 | 24,124,729 | 45,081,260 | 🏆 **Bigdecimal.js** (1.6x) |
| Add (money) | **67,963,559** | 25,363,310 | 9,038,864 | 11,798,727 | 786,356 | 🏆 **Bigdecimal.js** (2.7x) |
| Subtract (money) | **81,185,844** | 25,897,981 | 9,608,160 | 11,436,209 | 769,530 | 🏆 **Bigdecimal.js** (3.1x) |
| Multiply (money) | **80,121,218** | 21,444,002 | 5,627,504 | 9,161,687 | 626,712 | 🏆 **Bigdecimal.js** (3.7x) |
| Compare (money) | **304,624,803** | 87,403,800 | 47,921,701 | 25,649,615 | 38,541,528 | 🏆 **Bigdecimal.js** (3.5x) |

Two things worth noting. The money cohort — the most realistic workload — is where bigdecimal.js performs best in absolute terms. And the blended rows run at roughly the inflated cohort's rate, not the compact one's: the mixed dataset's cost is dominated by its large operands, and walking consecutive operands pairs values of very different magnitude whose scales have to be aligned.

bigdecimal.js posts the highest rate in most rows above. It trails big.js on `round`/`setScale`, where big.js's digit-array representation makes truncation nearly free. That gap is representational rather than incidental: it holds at roughly the same ratio across positive scales (0–40), across significant-digit precisions from 1 to 40, and across negative scales.

### Other engines: Bun (JavaScriptCore)

The table above is measured on Node.js, i.e. V8. Because bigdecimal.js builds on native `BigInt`, relative results depend on the engine's `BigInt` implementation — running the same suite under Bun (JavaScriptCore, the engine of Safari) reorders a few rows. Measured with the current 42-operation harness on bigdecimal.js 1.7.1 (Bun 1.3.14 on the Apple M1 / macOS 26.3 machine used for the 1.7.1 tables; the Node.js column below is from that same machine, not the table above); the preflight reported the same two known mismatches (`Constructor (from number)`, `Negative pow`) as on Node, so nothing here is a JavaScriptCore-only correctness difference.

bigdecimal.js still wins 35 of the 38 comparable rows on JavaScriptCore, same as on V8. Three rows change their winner:

| Operation | Node.js (V8) | Bun (JavaScriptCore) |
| --- | --- | --- |
| Constructor (from string) | 🏆 **Bigdecimal.js** (1.4×) | 🏆 **BigNumber.js** (1.1×) — JavaScriptCore parses decimal strings into `BigInt` more slowly than V8 |
| SetScale | 🏆 **Big.js** (1.9×) | *within noise* — Bigdecimal.js and BigNumber.js tie (13.07M vs 13.07M ops/sec) |
| SetScale (negative scales) | 🏆 **Big.js** (1.9×) | 🏆 **BigNumber.js** (1.2×), Bigdecimal.js third |

`Round` keeps its Big.js win on both engines. The largest single-engine gap is `ToString`, where bigdecimal.js's per-instance memoisation (see the note on that row above) is worth more on V8: 2.3× faster there than on JavaScriptCore for the identical code path.

To reproduce, run the suite with Bun: `bun benchmarks/index.js`.

## License

`GPL-2.0-only WITH Classpath-exception-2.0` — see [LICENSE](LICENSE).

bigdecimal.js is a port of `java.math.BigDecimal` from OpenJDK, which is distributed under the GNU General Public License version 2 with the Classpath Exception. As a derivative work this library carries the same terms. See [PROVENANCE.md](PROVENANCE.md) for the details of the derivation.

**The Classpath Exception means you can use this in proprietary software.** You may depend on bigdecimal.js from a program under any license, closed-source included, without that program becoming subject to the GPL. The GPL's obligations attach to this library's own source and to modifications of it — not to independent modules that merely link against it.

Releases up to and including 1.7.0 were published under Apache-2.0. The change applies from 1.7.1 onward; see [PROVENANCE.md](PROVENANCE.md) for what that does and does not settle about versions before it.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
