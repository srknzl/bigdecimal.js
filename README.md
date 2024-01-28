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
  * MacOS Monterey 13.0 (22A380)
* Update Date: November 19th 2022
* Library versions used:  
    * big.js 6.2.1
    * (this library) bigdecimal.js 1.3.0
    * bigdecimal 0.6.1
    * bignumber.js: 9.1.0
    * decimal.js:10.4.2

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, more operations will be added soon.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 43,477 ( - ) | 38,808 (<span style="color:red">-11%</span>) | 42,178 (<span style="color:red">-3%</span>) | 42,075 (<span style="color:red">-3%</span>) | 2,812 (<span style="color:red">-94%</span>) |
| Add | 79,582 ( - ) | 18,122 (<span style="color:red">-77%</span>) | 100,120 (<span style="color:green">**+26%**</span>) | 59,636 (<span style="color:red">-25%</span>) | 89 (<span style="color:red">-100%</span>) |
| Subtract | 74,226 ( - ) | 17,987 (<span style="color:red">-76%</span>) | 95,876 (<span style="color:green">**+29%**</span>) | 56,405 (<span style="color:red">-24%</span>) | 89 (<span style="color:red">-100%</span>) |
| Multiply | 498,374 ( - ) | 33,113 (<span style="color:red">-93%</span>) | 26,852 (<span style="color:red">-95%</span>) | 79,178 (<span style="color:red">-84%</span>) | 2,695 (<span style="color:red">-99%</span>) |
| Divide | 15,246 ( - ) | 1,129 (<span style="color:red">-93%</span>) | 11,575 (<span style="color:red">-24%</span>) | 13,700 (<span style="color:red">-10%</span>) | 673 (<span style="color:red">-96%</span>) |
| Remainder | 9,667 ( - ) | 3,888 (<span style="color:red">-60%</span>) | 13,541 (<span style="color:green">**+40%**</span>) | 22,060 (<span style="color:green">**+128%**</span>) | 2,585 (<span style="color:red">-73%</span>) |
| Positive pow | 27,675 ( - ) | 25 (<span style="color:red">-100%</span>) | 112 (<span style="color:red">-100%</span>) | 3,455 (<span style="color:red">-88%</span>) | 6 (<span style="color:red">-100%</span>) |
| Negative pow | 5,028 ( - ) | 21 (<span style="color:red">-100%</span>) | 109 (<span style="color:red">-98%</span>) | 1,953 (<span style="color:red">-61%</span>) | 276 (<span style="color:red">-95%</span>) |
| Abs | 781,477 ( - ) | 1,396,972 (<span style="color:green">**+79%**</span>) | 909,314 (<span style="color:green">**+16%**</span>) | 366,702 (<span style="color:red">-53%</span>) | 14,010 (<span style="color:red">-98%</span>) |
| Compare | 544,100 ( - ) | 1,188,332 (<span style="color:green">**+118%**</span>) | 776,758 (<span style="color:green">**+43%**</span>) | 426,463 (<span style="color:red">-22%</span>) | 1,004,854 (<span style="color:green">**+85%**</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
