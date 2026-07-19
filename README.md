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
* Update Date: July 15th 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.7.0
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor | **92,925** | 43,229 | 49,026 | 47,998 | 3,448 | 🏆 **Bigdecimal.js** (1.9×) |
| Add | **416,927** | 118,992 | 255,031 | 102,880 | 882 | 🏆 **Bigdecimal.js** (1.6×) |
| Subtract | **407,903** | 100,556 | 231,897 | 103,756 | 814 | 🏆 **Bigdecimal.js** (1.8×) |
| Multiply | **837,887** | 33,510 | 91,703 | 80,826 | 3,252 | 🏆 **Bigdecimal.js** (9.1×) |
| Divide | **55,617** | 1,108 | 12,804 | 14,703 | 813 | 🏆 **Bigdecimal.js** (3.8×) |
| DivideToIntegralValue | **194,906** |  -  | 24,228 | 48,053 | 1,649 | 🏆 **Bigdecimal.js** (4.1×) |
| Remainder | **123,564** | 6,810 | 18,776 | 30,271 | 2,244 | 🏆 **Bigdecimal.js** (4.1×) |
| Positive pow | **31,769** | 26 | 118 | 3,598 | 7 | 🏆 **Bigdecimal.js** (8.8×) |
| Negative pow | **13,642** | 22 | 114 | 1,993 | 334 | 🏆 **Bigdecimal.js** (6.8×) |
| Sqrt | **5,632** | 48 | 1,173 | 1,575 |  -  | 🏆 **Bigdecimal.js** (3.6×) |
| Abs | **3,986,281** | 1,797,291 | 990,440 | 366,424 | 17,290 | 🏆 **Bigdecimal.js** (2.2×) |
| Negate | **3,282,506** | 1,762,001 | 960,448 | 377,185 | 8,808 | 🏆 **Bigdecimal.js** (1.9×) |
| Round | 306,206 | **668,047** |  -  | 188,869 | 5,259 | 🏆 **Big.js** (2.2×) |
| SetScale | 353,784 | **684,585** | 218,688 | 177,488 | 1,896 | 🏆 **Big.js** (1.9×) |
| Compare | **2,344,023** | 1,226,746 | 932,273 | 437,279 | 1,169,606 | 🏆 **Bigdecimal.js** (1.9×) |
| Equals | **8,829,128** | 1,230,994 | 927,999 | 432,378 | 1,626,161 | 🏆 **Bigdecimal.js** (5.4×) |
| Min | **2,117,867** |  -  | 466,892 | 149,704 | 36,667 | 🏆 **Bigdecimal.js** (4.5×) |
| Max | **2,120,100** |  -  | 466,093 | 149,571 | 31,322 | 🏆 **Bigdecimal.js** (4.5×) |
| MovePointLeft | **2,552,021** |  -  |  -  |  -  | 2,151 | 🏆 **Bigdecimal.js** (1186.6×) |
| MovePointRight | **1,243,076** |  -  |  -  |  -  | 2,061 | 🏆 **Bigdecimal.js** (603.2×) |
| ScaleByPowerOfTen | **9,342,274** |  -  | 64,751 |  -  | 8,927 | 🏆 **Bigdecimal.js** (144.3×) |
| StripTrailingZeros | **568,697** |  -  |  -  |  -  | 7,448 | 🏆 **Bigdecimal.js** (76.4×) |
| Ulp | **10,802,420** |  -  |  -  |  -  | 54,306 | 🏆 **Bigdecimal.js** (198.9×) |
| UnscaledValue | **3,212,765** |  -  |  -  |  -  | 11,142 | 🏆 **Bigdecimal.js** (288.3×) |
| ToString | **10,676,511** | 118,226 | 253,802 | 258,435 | 1,245,853 | 🏆 **Bigdecimal.js** (8.6×) |
| NumberValue | **760,852** | 104,744 | 234,134 | 119,574 | 288,163 | 🏆 **Bigdecimal.js** (2.6×) |
| ToBigInt | **296,985** |  -  |  -  |  -  | 2,361 | 🏆 **Bigdecimal.js** (125.8×) |

bigdecimal.js is the fastest in 25 of 27 operations. It trails big.js on `round`/`setScale`, where big.js's digit-array representation makes truncation nearly free.

### Other engines: Bun (JavaScriptCore)

The table above is measured on Node.js, i.e. V8. Because bigdecimal.js builds on native `BigInt`, relative results depend on the engine's `BigInt` implementation. Running the same suite on the same machine under Bun 1.3.14 (JavaScriptCore, the engine of Safari), bigdecimal.js is the fastest in 24 of 27 operations, and its absolute throughput is often higher than on V8 — for example ToString reaches 17.8M ops/sec (10.7M on V8), NumberValue 4.0M (761K on V8) and DivideToIntegralValue 215K (195K on V8).

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
