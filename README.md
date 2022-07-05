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
  * M1 2021 MacBook Pro 
  * 32 GB Ram
  * MacOS Monterey 12.2.1
* Update Date: June 16th 2022
* Library versions used:  
    * big.js 6.1.1
    * (this library) bigdecimal.js 1.1.3
    * bigdecimal 0.6.1
    * bignumber.js: 9.0.2
    * decimal.js:10.3.1

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, more operations will be added soon.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 43,241 ( - ) | 38,541 (<span style="color:red">-11%</span>) | 41,562 (<span style="color:red">-4%</span>) | 42,215 (<span style="color:red">-2%</span>) | 2,819 (<span style="color:red">-93%</span>) |
| Add | 80,361 ( - ) | 18,412 (<span style="color:red">-77%</span>) | 101,451 (<span style="color:green">**+26%**</span>) | 61,221 (<span style="color:red">-24%</span>) | 88 (<span style="color:red">-100%</span>) |
| Subtract | 75,214 ( - ) | 17,923 (<span style="color:red">-76%</span>) | 96,732 (<span style="color:green">**+29%**</span>) | 58,029 (<span style="color:red">-23%</span>) | 88 (<span style="color:red">-100%</span>) |
| Multiply | 499,103 ( - ) | 33,755 (<span style="color:red">-93%</span>) | 27,755 (<span style="color:red">-94%</span>) | 54,741 (<span style="color:red">-89%</span>) | 2,676 (<span style="color:red">-99%</span>) |
| Divide | 15,638 ( - ) | 1,140 (<span style="color:red">-93%</span>) | 12,465 (<span style="color:red">-20%</span>) | 14,276 (<span style="color:red">-9%</span>) | 676 (<span style="color:red">-96%</span>) |
| Remainder | 10,116 ( - ) | 3,972 (<span style="color:red">-61%</span>) | 14,243 (<span style="color:green">**+41%**</span>) | 23,152 (<span style="color:green">**+129%**</span>) | 2,608 (<span style="color:red">-74%</span>) |
| Positive pow | 28,044 ( - ) | 25 (<span style="color:red">-100%</span>) | 128 (<span style="color:red">-100%</span>) | 3,832 (<span style="color:red">-86%</span>) | 6 (<span style="color:red">-100%</span>) |
| Negative pow | 5,256 ( - ) | 21 (<span style="color:red">-100%</span>) | 123 (<span style="color:red">-98%</span>) | 2,125 (<span style="color:red">-60%</span>) | 279 (<span style="color:red">-95%</span>) |
| Abs | 798,287 ( - ) | 1,477,640 (<span style="color:green">**+85%**</span>) | 943,103 (<span style="color:green">**+18%**</span>) | 363,650 (<span style="color:red">-54%</span>) | 14,188 (<span style="color:red">-98%</span>) |
| Integer rounding | 98,711 ( - ) | 452,722 (<span style="color:green">**+359%**</span>) | 258,683 (<span style="color:green">**+162%**</span>) | 142,895 (<span style="color:green">**+45%**</span>) | 1,858 (<span style="color:red">-98%</span>) |
| Decimal scaling | 100,701 ( - ) | 504,081 (<span style="color:green">**+401%**</span>) | 240,468 (<span style="color:green">**+139%**</span>) | 130,065 (<span style="color:green">**+29%**</span>) | 1,682 (<span style="color:red">-98%</span>) |
| Compare | 551,334 ( - ) | 1,241,313 (<span style="color:green">**+125%**</span>) | 789,202 (<span style="color:green">**+43%**</span>) | 415,718 (<span style="color:red">-25%</span>) | 1,024,768 (<span style="color:green">**+86%**</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
