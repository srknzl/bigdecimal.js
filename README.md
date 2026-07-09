# BigDecimal.js

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![codecov](https://codecov.io/gh/srknzl/bigdecimal.js/branch/main/graph/badge.svg?token=Y9PL8TFV2L)](https://codecov.io/gh/srknzl/bigdecimal.js)

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal implementation for Node.js 10.4 and above, and for browsers that support native `BigInt` (Chrome 67+, Firefox 68+, Safari 14+).
This implementation is inspired from java BigDecimal class. This implementation is faster than popular big decimal libraries for most operations.
See [benchmarks results part below](https://github.com/srknzl/bigdecimal.js#benchmark-results) for comparison of each operation.

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

* [API Documentation](https://srknzl.github.io/bigdecimal.js)

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
* Update Date: July 10th 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.5.1
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor | **93,779** | 41,763 | 46,527 | 47,096 | 3,488 | 🏆 **Bigdecimal.js** (2.0×) |
| Add | **442,537** | 119,788 | 260,192 | 101,015 | 895 | 🏆 **Bigdecimal.js** (1.7×) |
| Subtract | **408,086** | 102,520 | 238,409 | 103,944 | 861 | 🏆 **Bigdecimal.js** (1.7×) |
| Multiply | **848,781** | 33,785 | 91,903 | 81,919 | 3,162 | 🏆 **Bigdecimal.js** (9.2×) |
| Divide | **39,520** | 1,090 | 12,695 | 14,965 | 807 | 🏆 **Bigdecimal.js** (2.6×) |
| DivideToIntegralValue | 16,051 |  -  | 23,701 | **47,231** | 1,453 | 🏆 **decimal.js** (2.0×) |
| Remainder | 15,789 | 7,393 | 19,041 | **30,891** | 2,279 | 🏆 **decimal.js** (1.6×) |
| Positive pow | **31,771** | 26 | 118 | 3,611 | 7 | 🏆 **Bigdecimal.js** (8.8×) |
| Negative pow | **10,142** | 22 | 113 | 2,019 | 334 | 🏆 **Bigdecimal.js** (5.0×) |
| Sqrt | **4,960** | 48 | 1,162 | 1,584 |  -  | 🏆 **Bigdecimal.js** (3.1×) |
| Abs | **3,955,846** | 1,808,679 | 982,481 | 351,996 | 17,393 | 🏆 **Bigdecimal.js** (2.2×) |
| Negate | **3,280,750** | 1,778,738 | 954,034 | 361,869 | 8,990 | 🏆 **Bigdecimal.js** (1.8×) |
| Round | 190,517 | **669,441** |  -  | 186,759 | 5,330 | 🏆 **Big.js** (3.5×) |
| SetScale | 304,017 | **682,850** | 219,248 | 175,313 | 1,913 | 🏆 **Big.js** (2.2×) |
| Compare | **2,065,774** | 1,243,907 | 942,303 | 420,017 | 1,157,599 | 🏆 **Bigdecimal.js** (1.7×) |
| Equals | **8,732,574** | 1,232,550 | 926,046 | 417,482 | 1,619,827 | 🏆 **Bigdecimal.js** (5.4×) |
| Min | **1,750,053** |  -  | 462,664 | 143,793 | 37,196 | 🏆 **Bigdecimal.js** (3.8×) |
| Max | **1,787,793** |  -  | 465,469 | 145,346 | 31,895 | 🏆 **Bigdecimal.js** (3.8×) |
| MovePointLeft | **2,549,444** |  -  |  -  |  -  | 2,168 | 🏆 **Bigdecimal.js** (1176.1×) |
| MovePointRight | **1,242,843** |  -  |  -  |  -  | 2,075 | 🏆 **Bigdecimal.js** (599.0×) |
| ScaleByPowerOfTen | **9,367,076** |  -  | 65,704 |  -  | 9,073 | 🏆 **Bigdecimal.js** (142.6×) |
| StripTrailingZeros | **495,846** |  -  |  -  |  -  | 7,470 | 🏆 **Bigdecimal.js** (66.4×) |
| Ulp | **10,790,507** |  -  |  -  |  -  | 55,046 | 🏆 **Bigdecimal.js** (196.0×) |
| UnscaledValue | **3,224,447** |  -  |  -  |  -  | 11,115 | 🏆 **Bigdecimal.js** (290.1×) |
| ToString | **10,721,214** | 118,681 | 253,251 | 254,004 | 1,238,199 | 🏆 **Bigdecimal.js** (8.7×) |
| NumberValue | **759,586** | 105,392 | 233,353 | 119,015 | 289,260 | 🏆 **Bigdecimal.js** (2.6×) |
| ToBigInt | **247,680** |  -  |  -  |  -  | 2,388 | 🏆 **Bigdecimal.js** (103.7×) |

bigdecimal.js is the fastest in 23 of 27 operations. It trails decimal.js on `remainder`/`divideToIntegralValue`, and big.js on `round`/`setScale`.

### Other engines: Bun (JavaScriptCore)

The table above is measured on Node.js, i.e. V8. Because bigdecimal.js builds on native `BigInt`, relative results depend on the engine's `BigInt` implementation. Running the same suite on the same machine under Bun 1.3.14 (JavaScriptCore, the engine of Safari), bigdecimal.js is the fastest in 22 of 27 operations, and its absolute throughput is often higher than on V8 — for example ToString reaches 18.3M ops/sec (10.7M on V8), NumberValue 5.7M (760K on V8) and Divide 50K (40K on V8).

Operations where the outcome differs on JavaScriptCore:

| Operation | Node.js (V8) | Bun (JavaScriptCore) |
| --- | --- | --- |
| Constructor | 🏆 **Bigdecimal.js** (2.0×) | 🏆 **Big.js** (1.0×) — JavaScriptCore parses decimal strings into `BigInt` more slowly than V8 |
| Round | 🏆 **Big.js** (3.5×) | 🏆 **decimal.js** (2.0×) |
| SetScale | 🏆 **Big.js** (2.2×) | 🏆 **decimal.js** (1.1×), Bigdecimal.js a close second |
| DivideToIntegralValue | 🏆 **decimal.js** (2.0×) | 🏆 **decimal.js** (1.4×) |
| Remainder | 🏆 **decimal.js** (1.6×) | 🏆 **decimal.js** (1.2×) |

To reproduce, run the suite with Bun: `bun benchmarks/index.js`.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
