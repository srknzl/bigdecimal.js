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
* Update Date: July 7th 2026
* Library versions used:  
    * big.js 7.0.1
    * (this library) bigdecimal.js 1.3.4
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor | 47,197 | 43,084 | **48,906** | 47,047 | 3,440 | 🏆 **BigNumber.js** (1.0×) |
| Add | 175,505 | 119,356 | **258,371** | 103,401 | 894 | 🏆 **BigNumber.js** (1.5×) |
| Subtract | 168,752 | 104,365 | **237,684** | 104,598 | 857 | 🏆 **BigNumber.js** (1.4×) |
| Multiply | **829,584** | 33,576 | 91,739 | 82,160 | 3,297 | 🏆 **Bigdecimal.js** (9.0×) |
| Divide | **28,407** | 1,105 | 12,799 | 14,708 | 813 | 🏆 **Bigdecimal.js** (1.9×) |
| DivideToIntegralValue | 14,448 |  -  | 24,280 | **47,989** | 1,652 | 🏆 **decimal.js** (2.0×) |
| Remainder | 13,772 | 7,437 | 18,962 | **30,304** | 2,261 | 🏆 **decimal.js** (1.6×) |
| Positive pow | **32,002** | 26 | 118 | 3,599 | 7 | 🏆 **Bigdecimal.js** (8.9×) |
| Negative pow | **7,610** | 22 | 113 | 1,998 | 330 | 🏆 **Bigdecimal.js** (3.8×) |
| Sqrt | **2,900** | 48 | 1,170 | 1,567 |  -  | 🏆 **Bigdecimal.js** (1.9×) |
| Abs | **4,004,930** | 1,719,831 | 933,733 | 338,904 | 16,537 | 🏆 **Bigdecimal.js** (2.3×) |
| Negate | **3,191,540** | 1,708,320 | 942,038 | 358,740 | 8,844 | 🏆 **Bigdecimal.js** (1.9×) |
| Round | 184,319 | **662,321** |  -  | 186,140 | 5,248 | 🏆 **Big.js** (3.6×) |
| SetScale | 218,675 | **681,728** | 218,036 | 174,629 | 1,898 | 🏆 **Big.js** (3.1×) |
| Compare | **2,052,260** | 1,204,625 | 935,068 | 412,959 | 1,158,655 | 🏆 **Bigdecimal.js** (1.7×) |
| Equals | **8,733,455** | 1,226,877 | 887,855 | 413,770 | 1,608,007 | 🏆 **Bigdecimal.js** (5.4×) |
| Min | **2,062,634** |  -  | 467,273 | 143,992 | 36,537 | 🏆 **Bigdecimal.js** (4.4×) |
| Max | **2,063,107** |  -  | 468,260 | 144,329 | 31,316 | 🏆 **Bigdecimal.js** (4.4×) |
| MovePointLeft | **968,882** |  -  |  -  |  -  | 2,163 | 🏆 **Bigdecimal.js** (447.9×) |
| MovePointRight | **696,609** |  -  |  -  |  -  | 2,070 | 🏆 **Bigdecimal.js** (336.5×) |
| ScaleByPowerOfTen | **9,346,122** |  -  | 65,641 |  -  | 8,993 | 🏆 **Bigdecimal.js** (142.4×) |
| StripTrailingZeros | **490,230** |  -  |  -  |  -  | 7,439 | 🏆 **Bigdecimal.js** (65.9×) |
| Ulp | **10,762,904** |  -  |  -  |  -  | 54,993 | 🏆 **Bigdecimal.js** (195.7×) |
| UnscaledValue | **3,230,012** |  -  |  -  |  -  | 11,176 | 🏆 **Bigdecimal.js** (289.0×) |
| ToString | **10,724,710** | 118,631 | 253,917 | 256,382 | 1,237,212 | 🏆 **Bigdecimal.js** (8.7×) |
| NumberValue | **755,395** | 104,712 | 234,647 | 119,432 | 286,356 | 🏆 **Bigdecimal.js** (2.6×) |
| ToBigInt | **165,738** |  -  |  -  |  -  | 2,381 | 🏆 **Bigdecimal.js** (69.6×) |

bigdecimal.js is the fastest in 20 of 27 operations. It trails BigNumber.js on `add`/`subtract`/constructor, decimal.js on `remainder`/`divideToIntegralValue`, and big.js on `round`/`setScale`.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
