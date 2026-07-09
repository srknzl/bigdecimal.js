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
* Update Date: July 9th 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.5.0
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor | 46,381 | 42,968 | **48,803** | 46,731 | 3,428 | 🏆 **BigNumber.js** (1.0×) |
| Add | **414,472** | 116,951 | 255,820 | 104,887 | 877 | 🏆 **Bigdecimal.js** (1.6×) |
| Subtract | **400,652** | 103,274 | 236,817 | 103,497 | 847 | 🏆 **Bigdecimal.js** (1.7×) |
| Multiply | **834,455** | 33,353 | 90,800 | 81,674 | 3,326 | 🏆 **Bigdecimal.js** (9.2×) |
| Divide | **40,246** | 1,113 | 11,840 | 14,642 | 780 | 🏆 **Bigdecimal.js** (2.7×) |
| DivideToIntegralValue | 15,904 |  -  | 24,100 | **47,518** | 1,619 | 🏆 **decimal.js** (2.0×) |
| Remainder | 15,539 | 7,296 | 18,734 | **30,725** | 2,219 | 🏆 **decimal.js** (1.6×) |
| Positive pow | **31,625** | 26 | 118 | 3,598 | 7 | 🏆 **Bigdecimal.js** (8.8×) |
| Negative pow | **10,277** | 21 | 112 | 2,020 | 328 | 🏆 **Bigdecimal.js** (5.1×) |
| Sqrt | **4,626** | 47 | 1,134 | 1,591 |  -  | 🏆 **Bigdecimal.js** (2.9×) |
| Abs | **3,805,265** | 1,652,911 | 968,714 | 359,962 | 16,865 | 🏆 **Bigdecimal.js** (2.3×) |
| Negate | **3,165,080** | 1,698,655 | 947,273 | 373,560 | 8,968 | 🏆 **Bigdecimal.js** (1.9×) |
| Round | 186,108 | **670,212** |  -  | 189,077 | 5,305 | 🏆 **Big.js** (3.5×) |
| SetScale | 301,035 | **669,494** | 216,259 | 176,600 | 1,897 | 🏆 **Big.js** (2.2×) |
| Compare | **2,042,902** | 1,215,968 | 933,537 | 431,677 | 1,156,732 | 🏆 **Bigdecimal.js** (1.7×) |
| Equals | **8,715,019** | 1,199,734 | 896,538 | 429,792 | 1,600,911 | 🏆 **Bigdecimal.js** (5.4×) |
| Min | **1,748,421** |  -  | 454,418 | 146,101 | 37,080 | 🏆 **Bigdecimal.js** (3.8×) |
| Max | **1,747,840** |  -  | 463,650 | 149,569 | 30,801 | 🏆 **Bigdecimal.js** (3.8×) |
| MovePointLeft | **2,516,913** |  -  |  -  |  -  | 2,137 | 🏆 **Bigdecimal.js** (1177.5×) |
| MovePointRight | **1,223,987** |  -  |  -  |  -  | 1,981 | 🏆 **Bigdecimal.js** (617.7×) |
| ScaleByPowerOfTen | **9,162,274** |  -  | 64,836 |  -  | 8,694 | 🏆 **Bigdecimal.js** (141.3×) |
| StripTrailingZeros | **471,840** |  -  |  -  |  -  | 6,805 | 🏆 **Bigdecimal.js** (69.3×) |
| Ulp | **10,431,837** |  -  |  -  |  -  | 51,290 | 🏆 **Bigdecimal.js** (203.4×) |
| UnscaledValue | **3,044,336** |  -  |  -  |  -  | 10,792 | 🏆 **Bigdecimal.js** (282.1×) |
| ToString | **10,528,859** | 116,635 | 252,766 | 246,352 | 1,238,030 | 🏆 **Bigdecimal.js** (8.5×) |
| NumberValue | **754,721** | 104,168 | 229,906 | 117,011 | 284,352 | 🏆 **Bigdecimal.js** (2.7×) |
| ToBigInt | **245,608** |  -  |  -  |  -  | 2,311 | 🏆 **Bigdecimal.js** (106.3×) |

bigdecimal.js is the fastest in 22 of 27 operations. It trails BigNumber.js marginally on the constructor, decimal.js on `remainder`/`divideToIntegralValue`, and big.js on `round`/`setScale`.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
