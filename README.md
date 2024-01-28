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

For now, benchmarked against [big.js](https://www.npmjs.com/package/big.js) and [bigdecimal](https://www.npmjs.com/package/bigdecimal).

* Test Machine:
  * M1 2021 MacBook Air 
  * 16 GB Ram
  * MacOS Sonoma 14.2.1
* Update Date: January 28th 2024
* Library versions used:  
    * big.js 6.2.1
    * (this library) bigdecimal.js 1.3.1
    * bigdecimal 0.6.1
    * bignumber.js: 9.1.2
    * decimal.js:10.4.3

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, more operations will be added later.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 43,962 ( - ) | 38,238 (<span style="color:red">-13%</span>) | 42,337 (<span style="color:red">-4%</span>) | 42,355 (<span style="color:red">-4%</span>) | 2,818 (<span style="color:red">-94%</span>) |
| Add | 80,569 ( - ) | 18,406 (<span style="color:red">-77%</span>) | 100,734 (<span style="color:green">**+25%**</span>) | 59,815 (<span style="color:red">-26%</span>) | 90 (<span style="color:red">-100%</span>) |
| Subtract | 73,518 ( - ) | 18,265 (<span style="color:red">-75%</span>) | 96,022 (<span style="color:green">**+31%**</span>) | 57,130 (<span style="color:red">-22%</span>) | 89 (<span style="color:red">-100%</span>) |
| Multiply | 493,291 ( - ) | 33,422 (<span style="color:red">-93%</span>) | 26,810 (<span style="color:red">-95%</span>) | 79,995 (<span style="color:red">-84%</span>) | 2,609 (<span style="color:red">-99%</span>) |
| Divide | 15,341 ( - ) | 1,129 (<span style="color:red">-93%</span>) | 11,721 (<span style="color:red">-24%</span>) | 13,301 (<span style="color:red">-13%</span>) | 645 (<span style="color:red">-96%</span>) |
| Remainder | 9,362 ( - ) | 3,816 (<span style="color:red">-59%</span>) | 13,470 (<span style="color:green">**+44%**</span>) | 21,952 (<span style="color:green">**+134%**</span>) | 2,445 (<span style="color:red">-74%</span>) |
| Positive pow | 27,403 ( - ) | 25 (<span style="color:red">-100%</span>) | 113 (<span style="color:red">-100%</span>) | 3,535 (<span style="color:red">-87%</span>) | 6 (<span style="color:red">-100%</span>) |
| Negative pow | 4,863 ( - ) | 21 (<span style="color:red">-100%</span>) | 109 (<span style="color:red">-98%</span>) | 1,970 (<span style="color:red">-59%</span>) | 264 (<span style="color:red">-95%</span>) |
| Abs | 782,251 ( - ) | 1,424,376 (<span style="color:green">**+82%**</span>) | 917,526 (<span style="color:green">**+17%**</span>) | 358,678 (<span style="color:red">-54%</span>) | 14,132 (<span style="color:red">-98%</span>) |
| Compare | 546,243 ( - ) | 1,216,388 (<span style="color:green">**+123%**</span>) | 783,432 (<span style="color:green">**+43%**</span>) | 417,873 (<span style="color:red">-24%</span>) | 990,187 (<span style="color:green">**+81%**</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
