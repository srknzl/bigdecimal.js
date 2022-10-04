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

For now, benchmarked against [big.js](https://www.npmjs.com/package/big.js) and [bigdecimal](https://www.npmjs.com/package/bigdecimal).

* Test Machine:
  * M1 2021 MacBook Air 
  * 16 GB Ram
  * MacOS Monterey 12.4
* Update Date: September 30th 2022
* Library versions used:  
    * big.js 6.2.1
    * (this library) bigdecimal.js 1.2.0
    * bigdecimal 0.6.1
    * bignumber.js: 9.1.0
    * decimal.js:10.4.1

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, more operations will be added soon.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 44,023 ( - ) | 38,837 (<span style="color:red">-12%</span>) | 42,904 (<span style="color:red">-3%</span>) | 42,332 (<span style="color:red">-4%</span>) | 2,867 (<span style="color:red">-93%</span>) |
| Add | 80,680 ( - ) | 18,565 (<span style="color:red">-77%</span>) | 102,628 (<span style="color:green">**+27%**</span>) | 60,988 (<span style="color:red">-24%</span>) | 89 (<span style="color:red">-100%</span>) |
| Subtract | 74,621 ( - ) | 18,297 (<span style="color:red">-75%</span>) | 97,269 (<span style="color:green">**+30%**</span>) | 56,907 (<span style="color:red">-24%</span>) | 89 (<span style="color:red">-100%</span>) |
| Multiply | 503,718 ( - ) | 33,486 (<span style="color:red">-93%</span>) | 27,603 (<span style="color:red">-95%</span>) | 81,700 (<span style="color:red">-84%</span>) | 2,720 (<span style="color:red">-99%</span>) |
| Divide | 15,352 ( - ) | 1,129 (<span style="color:red">-93%</span>) | 12,169 (<span style="color:red">-21%</span>) | 14,022 (<span style="color:red">-9%</span>) | 679 (<span style="color:red">-96%</span>) |
| Remainder | 9,557 ( - ) | 3,916 (<span style="color:red">-59%</span>) | 14,052 (<span style="color:green">**+47%**</span>) | 22,538 (<span style="color:green">**+136%**</span>) | 2,605 (<span style="color:red">-73%</span>) |
| Positive pow | 27,710 ( - ) | 25 (<span style="color:red">-100%</span>) | 121 (<span style="color:red">-100%</span>) | 3,685 (<span style="color:red">-87%</span>) | 6 (<span style="color:red">-100%</span>) |
| Negative pow | 4,783 ( - ) | 21 (<span style="color:red">-100%</span>) | 117 (<span style="color:red">-98%</span>) | 2,063 (<span style="color:red">-57%</span>) | 277 (<span style="color:red">-94%</span>) |
| Abs | 771,310 ( - ) | 1,329,070 (<span style="color:green">**+72%**</span>) | 904,043 (<span style="color:green">**+17%**</span>) | 339,619 (<span style="color:red">-56%</span>) | 13,737 (<span style="color:red">-98%</span>) |
| Compare | 536,627 ( - ) | 1,180,043 (<span style="color:green">**+120%**</span>) | 764,960 (<span style="color:green">**+43%**</span>) | 393,814 (<span style="color:red">-27%</span>) | 1,010,649 (<span style="color:green">**+88%**</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
