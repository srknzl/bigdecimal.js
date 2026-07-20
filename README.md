# BigDecimal.js

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![codecov](https://codecov.io/gh/srknzl/bigdecimal.js/branch/main/graph/badge.svg?token=Y9PL8TFV2L)](https://codecov.io/gh/srknzl/bigdecimal.js)

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal implementation for Node.js 18 and above, and for browsers that support native `BigInt` (Chrome 67+, Firefox 68+, Safari 14+).
This implementation is inspired from java BigDecimal class. This implementation is faster than popular big decimal libraries for most operations.
See [benchmarks results part below](https://github.com/srknzl/bigdecimal.js#benchmark-results) for comparison of each operation.

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

Benchmarked against [big.js](https://www.npmjs.com/package/big.js), [bigdecimal](https://www.npmjs.com/package/bigdecimal) (GWT-based), [bignumber.js](https://www.npmjs.com/package/bignumber.js) and [decimal.js](https://www.npmjs.com/package/decimal.js).

* Test Machine:
  * Apple M1
  * 8 GB Ram
  * macOS 26.3
  * Node.js 24
* Update Date: July 20th 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.7.1
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers. Rows whose cost depends on their argument (`Round`, `SetScale`, `MovePointLeft`/`Right`, `ScaleByPowerOfTen`) cycle through a range of arguments rather than a single hard-coded one.
* Before timing, the harness verifies that every library computes the **same result** for each operation — every result in the batch, not a sample — and runs that check in a **separate process**, so stringifying results to compare them cannot warm the lazy caches the suite is about to measure.
* **A winner is only declared for rows that are actually a like-for-like race.** If the libraries disagree on the result, work to different precision bases, implement different semantics, or only one of them implements the operation at all, the row reports its rates with no trophy. Margins are claimed only when the winner's measured error interval clears the runner-up's; otherwise the row reads *within noise*. Raw machine-readable results are written to `benchmarks/results.json`.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor (from string) | **6,043,887** | 4,195,972 | 3,247,185 | 2,931,506 | 258,913 | 🏆 **Bigdecimal.js** (1.4x) |
| Constructor (from number) | 7,576,681 | 5,176,388 | 3,919,409 | 3,877,530 | 250,414 | not comparable &sup2; |
| Add | **14,229,864** | 4,104,673 | 8,930,482 | 4,929,984 | 31,122 | 🏆 **Bigdecimal.js** (1.6x) |
| Subtract | **13,743,623** | 3,582,666 | 8,194,245 | 4,713,292 | 29,768 | 🏆 **Bigdecimal.js** (1.7x) |
| Multiply | **29,533,206** | 1,162,450 | 3,182,634 | 2,703,482 | 115,628 | 🏆 **Bigdecimal.js** (9.3x) |
| Divide (50 significant digits) | **1,871,711** |  -  |  -  | 519,219 | 28,432 | 🏆 **Bigdecimal.js** (3.6x) |
| Divide (50 decimal places) | **3,143,825** | 38,247 | 447,610 |  -  |  -  | 🏆 **Bigdecimal.js** (7.0x) |
| DivideToIntegralValue | **6,929,746** |  -  | 848,253 | 1,657,834 | 57,258 | 🏆 **Bigdecimal.js** (4.2x) |
| Remainder | **4,483,372** | 257,894 | 671,933 | 1,072,037 | 76,267 | 🏆 **Bigdecimal.js** (4.2x) |
| Positive pow | **8,120,873** | 19,787 | 78,783 | 47,267 | 4,747 | 🏆 **Bigdecimal.js** (103.1x) |
| Negative pow | 551,844 | 6,821 | 35,693 | 98,234 | 14,022 | not comparable &sup2; |
| Sqrt | 194,241 | 1,735 | 42,447 | 61,617 |  -  | not comparable &#8309; |
| Abs | **128,346,670** | 64,251,496 | 34,883,119 | 12,119,044 | 627,442 | 🏆 **Bigdecimal.js** (2.0x) |
| Negate | **78,316,396** | 63,124,412 | 34,658,534 | 12,484,994 | 324,386 | 🏆 **Bigdecimal.js** (1.2x) |
| Round | 7,040,580 | **22,228,115** |  -  | 5,988,927 | 237,352 | 🏆 **Big.js** (3.2x) |
| SetScale | 11,915,905 | **22,984,262** | 10,568,821 | 6,805,968 | 62,691 | 🏆 **Big.js** (1.9x) |
| SetScale (negative scales) | 7,312,717 | **16,548,250** | 8,735,792 |  -  | 87,508 | 🏆 **Big.js** (1.9x) |
| Compare | **80,452,682** | 45,633,664 | 33,290,710 | 14,342,564 | 40,143,511 | 🏆 **Bigdecimal.js** (1.8x) |
| Equals | 299,142,435 | 45,925,211 | 33,242,317 | 14,378,704 | 56,851,480 | not comparable &#8308; |
| Min | **72,682,832** |  -  | 16,664,155 | 4,902,009 | 1,272,017 | 🏆 **Bigdecimal.js** (4.4x) |
| Max | **72,889,348** |  -  | 16,693,262 | 4,886,171 | 1,096,132 | 🏆 **Bigdecimal.js** (4.4x) |
| MovePointLeft | **43,676,966** |  -  |  -  |  -  | 70,409 | 🏆 **Bigdecimal.js** (620.3x) |
| MovePointRight | **47,562,716** |  -  |  -  |  -  | 68,349 | 🏆 **Bigdecimal.js** (695.9x) |
| ScaleByPowerOfTen | **120,945,092** |  -  | 2,077,470 |  -  | 318,469 | 🏆 **Bigdecimal.js** (58.2x) |
| StripTrailingZeros | **21,166,976** |  -  |  -  |  -  | 270,002 | 🏆 **Bigdecimal.js** (78.4x) |
| Ulp | **191,628,137** |  -  |  -  |  -  | 1,959,367 | 🏆 **Bigdecimal.js** (97.8x) |
| UnscaledValue | **120,729,014** |  -  |  -  |  -  | 401,821 | 🏆 **Bigdecimal.js** (300.5x) |
| ToString | **477,254,728** | 4,234,022 | 8,997,549 | 12,028,523 | 43,367,501 | 🏆 **Bigdecimal.js** (11.0x) &#8310; |
| NumberValue | **27,912,581** | 3,129,783 | 5,876,804 | 5,201,013 | 9,954,646 | 🏆 **Bigdecimal.js** (2.8x) |
| ToBigInt | **10,278,944** |  -  |  -  |  -  | 85,551 | 🏆 **Bigdecimal.js** (120.1x) |

&sup2; Libraries did not agree on the result, so rates are not a like-for-like comparison.
&#8308; The libraries implement different semantics here, so equal rates would not mean equal work.
&#8309; Precision basis differs between libraries (significant digits vs decimal places), so they are not doing equal work.
&#8310; ToString: bigdecimal.js memoises toString per instance; repeated calls on the same value read a warm cache.

### Workload cohorts

bigdecimal.js keeps a significand of up to 15 digits in a plain `number` (the *compact* path) and only inflates to `BigInt` beyond that. The blended table above mixes both, so it reports neither regime cleanly. The **money** cohort is ordinary currency arithmetic — two decimal places, magnitudes under 1e9 — which is what most callers actually run:

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Add (compact) | **33,081,703** | 11,890,970 | 5,549,990 | 5,489,052 | 608,639 | 🏆 **Bigdecimal.js** (2.8x) |
| Subtract (compact) | **39,117,025** | 10,545,499 | 5,756,486 | 5,566,898 | 629,004 | 🏆 **Bigdecimal.js** (3.7x) |
| Multiply (compact) | **45,780,797** | 9,626,315 | 5,033,788 | 6,276,386 | 581,085 | 🏆 **Bigdecimal.js** (4.8x) |
| Compare (compact) | **93,241,756** | 52,573,517 | 30,453,519 | 14,431,139 | 10,522,627 | 🏆 **Bigdecimal.js** (1.8x) |
| Add (inflated) | **13,982,954** | 2,269,699 | 3,862,954 | 4,575,386 | 15,539 | 🏆 **Bigdecimal.js** (3.1x) |
| Subtract (inflated) | **11,667,307** | 1,820,552 | 3,666,368 | 4,316,760 | 14,811 | 🏆 **Bigdecimal.js** (2.7x) |
| Multiply (inflated) | **32,143,326** | 384,076 | 1,282,752 | 1,231,227 | 53,320 | 🏆 **Bigdecimal.js** (25.1x) |
| Compare (inflated) | **55,035,878** | 40,038,707 | 29,782,989 | 12,334,647 | 24,751,841 | 🏆 **Bigdecimal.js** (1.4x) |
| Add (money) | **46,921,220** | 17,758,712 | 7,058,574 | 7,304,699 | 764,132 | 🏆 **Bigdecimal.js** (2.6x) |
| Subtract (money) | **55,498,366** | 14,749,204 | 7,041,060 | 6,975,336 | 751,021 | 🏆 **Bigdecimal.js** (3.8x) |
| Multiply (money) | **53,960,270** | 14,713,216 | 3,985,381 | 5,450,712 | 593,383 | 🏆 **Bigdecimal.js** (3.7x) |
| Compare (money) | **201,708,998** | 55,547,864 | 29,816,394 | 14,603,893 | 19,634,421 | 🏆 **Bigdecimal.js** (3.6x) |

Two things worth noting. The money cohort — the most realistic workload — is where bigdecimal.js performs best in absolute terms. And the blended rows are slower than *any* cohort, because walking consecutive operands in the mixed dataset pairs values of very different magnitude, and aligning their scales costs more than any like-with-like pairing.

bigdecimal.js posts the highest rate in most rows above. It trails big.js on `round`/`setScale`, where big.js's digit-array representation makes truncation nearly free. That gap is representational rather than incidental: it holds at roughly the same ratio across positive scales (0–40), across significant-digit precisions from 1 to 40, and across negative scales.

### Other engines: Bun (JavaScriptCore)

The table above is measured on Node.js, i.e. V8. Because bigdecimal.js builds on native `BigInt`, relative results depend on the engine's `BigInt` implementation — running the same suite under Bun (JavaScriptCore, the engine of Safari) reorders a few rows. Measured with the current 42-operation harness (Bun 1.3.14, same machine and AC conditions as the table above); the preflight reported the same two known mismatches (`Constructor (from number)`, `Negative pow`) as on Node, so nothing here is a JavaScriptCore-only correctness difference.

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
