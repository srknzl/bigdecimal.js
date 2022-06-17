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
* [big.js](https://github.com/MikeMcl/big.js)
* [bignumber.js](https://github.com/MikeMcl/bignumber.js)
* [decimal.js](https://github.com/MikeMcl/decimal.js)

To run the benchmark run `npm install` and then `npm run benchmark`.

## Benchmark Results

For now, benchmarked against [big.js](https://www.npmjs.com/package/big.js) and [bigdecimal](https://www.npmjs.com/package/bigdecimal).

* Test Machine:
  * M1 2021 MacBook Pro 
  * 32 GB Ram
  * MacOS Monterey 12.2.1
* Update Date: June 16th 2022
* Library versions used:  
    * big.js 6.1.1
    * (this library) bigdecimal.js 1.1.3
    * bigdecimal 0.6.1
    * bignumber.js: 9.0.2
    * decimal.js:10.3.1,

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, more operations will be added soon.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 44,092 ( - ) | 39,246 (<span style="color:red">-11%</span>) | 41,920 (<span style="color:red">-5%</span>) | 41,669 (<span style="color:red">-5%</span>) | 2,814 (<span style="color:red">-94%</span>) |
| Add | 80,748 ( - ) | 16,901 (<span style="color:red">-79%</span>) | 100,613 (<span style="color:green">**25%**</span>) | 59,138 (<span style="color:red">-27%</span>) | 88 (<span style="color:red">-100%</span>) |
| Subtract | 75,724 ( - ) | 18,438 (<span style="color:red">-76%</span>) | 96,361 (<span style="color:green">**27%**</span>) | 56,545 (<span style="color:red">-25%</span>) | 88 (<span style="color:red">-100%</span>) |
| Multiply | 503,550 ( - ) | 33,408 (<span style="color:red">-93%</span>) | 27,806 (<span style="color:red">-94%</span>) | 54,172 (<span style="color:red">-89%</span>) | 2,739 (<span style="color:red">-99%</span>) |
| Divide | 15,953 ( - ) | 1,157 (<span style="color:red">-93%</span>) | 12,530 (<span style="color:red">-21%</span>) | 14,611 (<span style="color:red">-8%</span>) | 686 (<span style="color:red">-96%</span>) |
| Remainder | 10,186 ( - ) | 4,002 (<span style="color:red">-61%</span>) | 14,416 (<span style="color:green">**42%**</span>) | 23,014 (<span style="color:green">**126%**</span>) | 2,640 (<span style="color:red">-74%</span>) |
| Positive pow | 28,230 ( - ) | 26 (<span style="color:red">-100%</span>) | 128 (<span style="color:red">-100%</span>) | 3,833 (<span style="color:red">-86%</span>) | 6 (<span style="color:red">-100%</span>) |
| Negative pow | 5,169 ( - ) | 21 (<span style="color:red">-100%</span>) | 123 (<span style="color:red">-98%</span>) | 2,131 (<span style="color:red">-59%</span>) | 278 (<span style="color:red">-95%</span>) |
| Abs | 795,097 ( - ) | 1,448,594 (<span style="color:green">**82%**</span>) | 948,990 (<span style="color:green">**19%**</span>) | 355,103 (<span style="color:red">-55%</span>) | 14,320 (<span style="color:red">-98%</span>) |
| Integer rounding | 99,357 ( - ) | 459,079 (<span style="color:green">**362%**</span>) | 266,314 (<span style="color:green">**168%**</span>) | 144,091 (<span style="color:green">**45%**</span>) | 1,878 (<span style="color:red">-98%</span>) |
| Decimal scale | 100,688 ( - ) | 502,895 (<span style="color:green">**399%**</span>) | 241,756 (<span style="color:green">**140%**</span>) | 130,178 (<span style="color:green">**29%**</span>) | 1,735 (<span style="color:red">-98%</span>) |
| Compare | 558,710 ( - ) | 1,237,538 (<span style="color:green">**121%**</span>) | 780,308 (<span style="color:green">**40%**</span>) | 296,844 (<span style="color:red">-47%</span>) | 1,006,175 (<span style="color:green">**80%**</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
