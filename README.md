# BigDecimal.js

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![codecov](https://codecov.io/gh/srknzl/bigdecimal.js/branch/main/graph/badge.svg?token=Y9PL8TFV2L)](https://codecov.io/gh/srknzl/bigdecimal.js)

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal implementation for Node.js 10.4 and above.
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
    * (this library) bigdecimal.js 1.3.3
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with a fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Numbers are operations per second (higher is better). In each row the **fastest library is bold**, and the **Fastest** column names the winner with how many times faster it is than the runner-up. A `-` means the library has no equivalent operation.

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased | Fastest |
| --- | --- | --- | --- | --- | --- | --- |
| Constructor | 46,777 | 43,377 | **49,384** | 47,382 | 3,495 | 🏆 **BigNumber.js** (1.0×) |
| Add | 161,701 | 119,691 | **256,662** | 103,824 | 892 | 🏆 **BigNumber.js** (1.6×) |
| Subtract | 154,979 | 103,969 | **239,972** | 104,086 | 857 | 🏆 **BigNumber.js** (1.5×) |
| Multiply | **722,266** | 33,614 | 91,680 | 81,760 | 3,308 | 🏆 **Bigdecimal.js** (7.9×) |
| Divide | **26,021** | 1,109 | 12,745 | 15,046 | 813 | 🏆 **Bigdecimal.js** (1.7×) |
| DivideToIntegralValue | 12,920 |  -  | 24,234 | **47,547** | 1,653 | 🏆 **decimal.js** (2.0×) |
| Remainder | 12,324 | 7,339 | 19,061 | **30,570** | 2,262 | 🏆 **decimal.js** (1.6×) |
| Positive pow | **31,421** | 26 | 118 | 3,611 | 7 | 🏆 **Bigdecimal.js** (8.7×) |
| Negative pow | **7,080** | 21 | 113 | 1,989 | 323 | 🏆 **Bigdecimal.js** (3.6×) |
| Sqrt | **2,859** | 47 | 1,139 | 1,539 |  -  | 🏆 **Bigdecimal.js** (1.9×) |
| Abs | **3,362,131** | 1,634,509 | 948,257 | 345,788 | 16,300 | 🏆 **Bigdecimal.js** (2.1×) |
| Negate | **2,323,855** | 1,630,179 | 909,804 | 361,079 | 8,690 | 🏆 **Bigdecimal.js** (1.4×) |
| Round | 170,345 | **645,649** |  -  | 182,171 | 5,275 | 🏆 **Big.js** (3.5×) |
| SetScale | 202,491 | **680,008** | 219,568 | 175,285 | 1,913 | 🏆 **Big.js** (3.1×) |
| Compare | **2,075,841** | 1,236,126 | 939,603 | 426,746 | 1,166,634 | 🏆 **Bigdecimal.js** (1.7×) |
| Equals | **8,846,038** | 1,236,935 | 929,267 | 422,313 | 1,631,265 | 🏆 **Bigdecimal.js** (5.4×) |
| Min | **2,077,059** |  -  | 466,934 | 146,093 | 36,820 | 🏆 **Bigdecimal.js** (4.4×) |
| Max | **2,074,011** |  -  | 466,559 | 145,401 | 31,546 | 🏆 **Bigdecimal.js** (4.4×) |
| MovePointLeft | **959,389** |  -  |  -  |  -  | 2,164 | 🏆 **Bigdecimal.js** (443.4×) |
| MovePointRight | **639,551** |  -  |  -  |  -  | 2,073 | 🏆 **Bigdecimal.js** (308.5×) |
| ScaleByPowerOfTen | **9,373,376** |  -  | 64,463 |  -  | 9,029 | 🏆 **Bigdecimal.js** (145.4×) |
| StripTrailingZeros | **409,776** |  -  |  -  |  -  | 7,512 | 🏆 **Bigdecimal.js** (54.5×) |
| Ulp | **10,777,156** |  -  |  -  |  -  | 53,781 | 🏆 **Bigdecimal.js** (200.4×) |
| UnscaledValue | **3,224,347** |  -  |  -  |  -  | 11,195 | 🏆 **Bigdecimal.js** (288.0×) |
| ToString | **10,611,938** | 118,249 | 252,958 | 259,124 | 1,241,692 | 🏆 **Bigdecimal.js** (8.5×) |
| NumberValue | **766,506** | 105,428 | 234,736 | 120,370 | 288,011 | 🏆 **Bigdecimal.js** (2.7×) |
| ToBigInt | **153,193** |  -  |  -  |  -  | 2,373 | 🏆 **Bigdecimal.js** (64.6×) |

bigdecimal.js is the fastest in 20 of 27 operations. It trails BigNumber.js on `add`/`subtract`/constructor, decimal.js on `remainder`/`divideToIntegralValue`, and big.js on `round`/`setScale`.

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
