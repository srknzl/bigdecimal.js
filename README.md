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
    * (this library) bigdecimal.js 1.3.2
    * bigdecimal 0.6.1
    * bignumber.js: 11.1.5
    * decimal.js: 10.6.0

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* A green percentage means the other library is faster than bigdecimal.js for that operation; red means it is slower.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | BigNumber.js | decimal.js | GWTBased |
| --- | --- | --- | --- | --- | --- |
| Constructor | 45,887 ( - ) | 42,897 (<span style="color:red">-7%</span>) | 48,456 (<span style="color:green">**+6%**</span>) | 45,833 ( - ) | 3,205 (<span style="color:red">-93%</span>) |
| Add | 118,793 ( - ) | 22,569 (<span style="color:red">-81%</span>) | 107,339 (<span style="color:red">-10%</span>) | 86,834 (<span style="color:red">-27%</span>) | 105 (<span style="color:red">-100%</span>) |
| Subtract | 110,650 ( - ) | 22,453 (<span style="color:red">-80%</span>) | 102,303 (<span style="color:red">-8%</span>) | 80,321 (<span style="color:red">-27%</span>) | 108 (<span style="color:red">-100%</span>) |
| Multiply | 847,935 ( - ) | 33,828 (<span style="color:red">-96%</span>) | 91,129 (<span style="color:red">-89%</span>) | 82,154 (<span style="color:red">-90%</span>) | 3,279 (<span style="color:red">-100%</span>) |
| Divide | 26,041 ( - ) | 1,105 (<span style="color:red">-96%</span>) | 12,644 (<span style="color:red">-51%</span>) | 15,206 (<span style="color:red">-42%</span>) | 814 (<span style="color:red">-97%</span>) |
| Remainder | 13,824 ( - ) | 3,878 (<span style="color:red">-72%</span>) | 15,079 (<span style="color:green">**+9%**</span>) | 23,919 (<span style="color:green">**+73%**</span>) | 3,091 (<span style="color:red">-78%</span>) |
| Positive pow | 31,912 ( - ) | 26 (<span style="color:red">-100%</span>) | 118 (<span style="color:red">-100%</span>) | 3,626 (<span style="color:red">-89%</span>) | 7 (<span style="color:red">-100%</span>) |
| Negative pow | 7,139 ( - ) | 22 (<span style="color:red">-100%</span>) | 113 (<span style="color:red">-98%</span>) | 2,036 (<span style="color:red">-71%</span>) | 335 (<span style="color:red">-95%</span>) |
| Abs | 3,555,797 ( - ) | 1,820,078 (<span style="color:red">-49%</span>) | 994,210 (<span style="color:red">-72%</span>) | 356,897 (<span style="color:red">-90%</span>) | 17,287 (<span style="color:red">-100%</span>) |
| Compare | 2,195,934 ( - ) | 1,222,181 (<span style="color:red">-44%</span>) | 933,381 (<span style="color:red">-57%</span>) | 423,271 (<span style="color:red">-81%</span>) | 1,197,847 (<span style="color:red">-45%</span>) |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
