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

> [!WARNING]
> **This table is provisional and is being re-measured.** Two things are wrong with it.
>
> The run that produced it was made while the test machine was in macOS low power mode,
> so the absolute rates are depressed and are not a valid basis for comparison against
> other published numbers. The relative ordering within each row is expected to hold
> (every library was throttled equally in the same run).
>
> It also predates a further harness rework, so some rows no longer exist in the form
> shown. `Constructor` has since been split into string and number inputs, because only
> the string half is a like-for-like race. More importantly, the harness no longer awards
> a winner to a row that is not comparable — on a re-run, `Constructor (from number)`,
> `Negative pow`, `Sqrt` and `Equals` will report rates with **no trophy** instead of a
> trophy plus a footnote. `Equals` in particular is not a fair race in either direction:
> bigdecimal.js implements Java's scale-sensitive `equals` (`2.0` does not equal `2.00`)
> while every other library does numeric equality, so the 4.6x figure below compares two
> different operations. Treat the whole table as indicative until this notice is removed.

Benchmarked against [big.js](https://www.npmjs.com/package/big.js), [bigdecimal](https://www.npmjs.com/package/bigdecimal) (GWT-based), [bignumber.js](https://www.npmjs.com/package/bignumber.js) and [decimal.js](https://www.npmjs.com/package/decimal.js).

* Test Machine:
  * Apple M1
  * 8 GB Ram
  * macOS 26.3
  * Node.js 24
* Update Date: July 19th 2026
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
| Constructor | **3,974,001** | 1,794,198 | 2,663,519 | 3,442,733 | 234,626 | 🏆 **Bigdecimal.js** (1.2x) &sup1; |
| Add | **13,884,549** | 3,970,123 | 9,004,834 | 4,016,814 | 30,526 | 🏆 **Bigdecimal.js** (1.5x) |
| Subtract | **13,148,108** | 3,478,423 | 8,409,868 | 4,404,558 | 29,398 | 🏆 **Bigdecimal.js** (1.6x) |
| Multiply | **28,201,852** | 1,181,338 | 3,202,515 | 2,658,251 | 111,814 | 🏆 **Bigdecimal.js** (8.8x) |
| Divide (50 significant digits) | **1,956,214** |  -  |  -  | 510,095 | 27,779 | 🏆 **Bigdecimal.js** (3.8x) |
| Divide (50 decimal places) | **3,184,006** | 32,686 | 441,966 |  -  |  -  | 🏆 **Bigdecimal.js** (7.2x) |
| DivideToIntegralValue | **6,430,792** |  -  | 838,635 | 1,654,166 | 56,885 | 🏆 **Bigdecimal.js** (3.9x) |
| Remainder | **4,158,685** | 225,717 | 657,873 | 1,039,243 | 77,685 | 🏆 **Bigdecimal.js** (4.0x) |
| Positive pow | **8,239,008** | 30,294 | 115,392 | 71,396 | 7,283 | 🏆 **Bigdecimal.js** (71.4x) |
| Negative pow | **559,299** | 6,466 | 34,552 | 95,880 | 13,500 | 🏆 **Bigdecimal.js** (5.8x) &sup1;&sup2; |
| Sqrt | **194,235** | 1,718 | 41,933 | 56,154 |  -  | 🏆 **Bigdecimal.js** (3.5x) &sup2; |
| Abs | **128,077,435** | 63,491,709 | 35,009,809 | 13,241,639 | 610,284 | 🏆 **Bigdecimal.js** (2.0x) |
| Negate | **78,180,233** | 63,104,385 | 34,171,634 | 13,781,982 | 310,294 | 🏆 **Bigdecimal.js** (1.2x) |
| Round | 7,698,823 | **21,897,334** |  -  | 5,997,010 | 210,247 | 🏆 **Big.js** (2.8x) |
| SetScale | 11,783,781 | **22,758,267** | 10,424,110 | 7,129,113 | 61,296 | 🏆 **Big.js** (1.9x) |
| SetScale (negative scales) | 7,488,293 | **16,149,259** | 8,544,401 |  -  | 85,576 | 🏆 **Big.js** (1.9x) |
| Compare | **79,449,704** | 44,449,279 | 32,284,743 | 15,210,847 | 19,068,071 | 🏆 **Bigdecimal.js** (1.8x) |
| Equals | **261,524,896** | 45,007,407 | 32,416,381 | 15,298,674 | 56,748,194 | 🏆 **Bigdecimal.js** (4.6x) |
| Min | **71,127,201** |  -  | 16,204,565 | 5,285,596 | 1,241,166 | 🏆 **Bigdecimal.js** (4.4x) |
| Max | **71,393,462** |  -  | 16,246,045 | 5,220,419 | 1,061,526 | 🏆 **Bigdecimal.js** (4.4x) |
| MovePointLeft | **43,806,902** |  -  |  -  |  -  | 69,616 | 🏆 **Bigdecimal.js** (629.3x) |
| MovePointRight | **48,138,424** |  -  |  -  |  -  | 68,098 | 🏆 **Bigdecimal.js** (706.9x) |
| ScaleByPowerOfTen | **133,110,892** |  -  | 2,068,515 |  -  | 314,260 | 🏆 **Bigdecimal.js** (64.4x) |
| StripTrailingZeros | **23,013,477** |  -  |  -  |  -  | 260,975 | 🏆 **Bigdecimal.js** (88.2x) |
| Ulp | **197,712,676** |  -  |  -  |  -  | 1,947,326 | 🏆 **Bigdecimal.js** (101.5x) |
| UnscaledValue | **120,170,711** |  -  |  -  |  -  | 394,724 | 🏆 **Bigdecimal.js** (304.4x) |
| ToString | **474,061,908** | 4,093,922 | 8,647,933 | 8,766,609 | 43,615,133 | 🏆 **Bigdecimal.js** (10.9x) |
| NumberValue | **28,995,101** | 3,128,418 | 5,780,200 | 4,321,807 | 10,190,697 | 🏆 **Bigdecimal.js** (2.8x) |
| ToBigInt | **10,243,130** |  -  |  -  |  -  | 84,381 | 🏆 **Bigdecimal.js** (121.4x) |

&sup1; The libraries did not agree on the result for this operation, so the rate is not a like-for-like comparison. For `Constructor`, the GWT port materialises the exact value of the lossy input double while the others keep ~17 significant digits.
&sup2; The precision basis differs between libraries for this operation (significant digits vs decimal places), so they are not doing equal work. For `Negative pow`, big.js and BigNumber.js return exactly `0` — the result vanishes entirely at 50 decimal places.

### Workload cohorts

bigdecimal.js keeps a significand of up to 15 digits in a plain `number` (the *compact* path) and only inflates to `BigInt` beyond that. The blended table above mixes both, so it reports neither regime cleanly. The **money** cohort is ordinary currency arithmetic — two decimal places, magnitudes under 1e9 — which is what most callers actually run:

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Add (compact) | **43,662,238** | 11,678,538 | 5,549,732 | 5,255,542 | 594,164 | 🏆 **Bigdecimal.js** (3.7x) |
| Subtract (compact) | **27,685,648** | 10,502,194 | 5,717,188 | 5,445,576 | 620,942 | 🏆 **Bigdecimal.js** (2.6x) |
| Multiply (compact) | **46,541,753** | 9,591,153 | 5,011,147 | 5,267,985 | 567,550 | 🏆 **Bigdecimal.js** (4.9x) |
| Compare (compact) | **84,013,512** | 51,623,929 | 30,839,157 | 15,076,334 | 9,970,568 | 🏆 **Bigdecimal.js** (1.6x) |
| Add (inflated) | **15,070,438** | 2,237,593 | 3,836,610 | 4,135,520 | 15,318 | 🏆 **Bigdecimal.js** (3.6x) |
| Subtract (inflated) | **12,661,662** | 1,816,166 | 3,696,599 | 3,844,926 | 14,621 | 🏆 **Bigdecimal.js** (3.3x) |
| Multiply (inflated) | **31,984,948** | 379,999 | 1,278,791 | 1,220,516 | 52,508 | 🏆 **Bigdecimal.js** (25.0x) |
| Compare (inflated) | **53,619,866** | 38,953,729 | 30,135,384 | 15,345,072 | 25,837,626 | 🏆 **Bigdecimal.js** (1.4x) |
| Add (money) | **54,837,492** | 17,552,569 | 6,997,305 | 6,789,269 | 750,944 | 🏆 **Bigdecimal.js** (3.1x) |
| Subtract (money) | **57,322,942** | 14,486,468 | 7,001,941 | 7,011,714 | 749,992 | 🏆 **Bigdecimal.js** (4.0x) |
| Multiply (money) | **55,208,694** | 14,567,024 | 3,942,507 | 4,606,867 | 580,726 | 🏆 **Bigdecimal.js** (3.8x) |
| Compare (money) | **200,543,297** | 54,050,255 | 30,066,391 | 15,525,093 | 19,002,598 | 🏆 **Bigdecimal.js** (3.7x) |

Two things worth noting. The money cohort — the most realistic workload — is where bigdecimal.js performs best in absolute terms. And the blended rows are slower than *any* cohort, because walking consecutive operands in the mixed dataset pairs values of very different magnitude, and aligning their scales costs more than any like-with-like pairing.

bigdecimal.js posts the highest rate in most rows above, but see the warning at the top of this section: the counts and the trophies are being restated on the re-run, and the rows that are not a like-for-like race will be reported without a winner rather than with a footnote. It trails big.js on `round`/`setScale`, where big.js's digit-array representation makes truncation nearly free. That gap is representational rather than incidental: it holds at roughly the same ratio across positive scales (0–40), across significant-digit precisions from 1 to 40, and across negative scales.

### Other engines: Bun (JavaScriptCore)

The table above is measured on Node.js, i.e. V8. Because bigdecimal.js builds on native `BigInt`, relative results depend on the engine's `BigInt` implementation — running the same suite under Bun (JavaScriptCore, the engine of Safari) reorders several rows.

> [!WARNING]
> **The JavaScriptCore figures below predate the benchmark harness rework and have
> not yet been re-measured.** They were produced by the previous harness, which
> reported Benchmark.js batch rates as if they were per-operation rates, and before
> division was split by precision basis. The operation count has since changed, so
> the "24 of 27" figure no longer corresponds to the current table. Treat this
> section as stale pending a re-run.

Operations where the outcome differs on JavaScriptCore:

| Operation | Node.js (V8) | Bun (JavaScriptCore) |
| --- | --- | --- |
| Constructor | 🏆 **Bigdecimal.js** (1.9×) | 🏆 **Big.js** (1.0×) — JavaScriptCore parses decimal strings into `BigInt` more slowly than V8 |
| Round | 🏆 **Big.js** (2.2×) | 🏆 **decimal.js** (1.4×) |
| SetScale | 🏆 **Big.js** (1.9×) | 🏆 **decimal.js** (1.2×), Bigdecimal.js second |

To reproduce, run the suite with Bun: `bun benchmarks/index.js`.

## License

`GPL-2.0-only WITH Classpath-exception-2.0` — see [LICENSE](LICENSE).

bigdecimal.js is a port of `java.math.BigDecimal` from OpenJDK, which is distributed under the GNU General Public License version 2 with the Classpath Exception. As a derivative work this library carries the same terms. See [PROVENANCE.md](PROVENANCE.md) for the details of the derivation.

**The Classpath Exception means you can use this in proprietary software.** You may depend on bigdecimal.js from a program under any license, closed-source included, without that program becoming subject to the GPL. The GPL's obligations attach to this library's own source and to modifications of it — not to independent modules that merely link against it.

Releases up to and including 1.7.0 were published under Apache-2.0; that grant still stands for those versions. The change applies from 1.7.1 onward.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
