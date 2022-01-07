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
const { Big } = require('bigdecimal.js');

// Single constructor for all values
// Construct from a string and copy it

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

const res1 = x.divide(y, MC(3)); // MC is MathContext constructor that can be used without `new`
console.log(res1.toString()); // 0.333

const res2 = x.divide(y, new MC(3, RoundingMode.UP));
console.log(res2.toString()); // 0.334

try {
    x.divide(y);
    // throws since full precision is requested but it is not possible
} catch (e) {
    console.log(e); // RangeError: Non-terminating decimal expansion; no exact representable decimal result.
}
```
## Documentation

* [API Documentation](https://srknzl.github.io/bigdecimal.js/api/current/docs)

## Testing

* Install dependencies: `npm i`
* Compile: `npm run compile`
* Run tests: `npm test`

## Running Benchmarks

There is a benchmark suite that compares

* This library
* [big.js](https://github.com/MikeMcl/big.js)
* [GWT based BigDecimal](https://github.com/iriscouch/bigdecimal.js)

To run the benchmark run `npm install` and then `npm run benchmark`.

## Benchmark Results

For now, benchmarked against [big.js](https://www.npmjs.com/package/big.js) and [bigdecimal](https://www.npmjs.com/package/bigdecimal).

* Test Machine:
  * M1 2020 Macbook Air
  * 8 GB Ram
  * MacOS Monterey 12.0.1
* Update Date: January 7th 2022
* Library versions used:  
    * big.js 6.1.1
    * (this library) bigdecimal.js 1.1.1
    * bigdecimal 0.6.1

* Each operation is run with fixed set of decimal numbers composed of both simple and complex numbers.
* Micro benchmark framework used is [benchmark](https://www.npmjs.com/package/benchmark). Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* For now, benchmarked the following operations, all operations will be added soon.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | GWT | Winner |
| --- | --- | --- | --- | --- |
| Add | 79,130 | 18,675 | 85.21 | BigDecimal.js |
| Multiply | 495,894 | 33,534 | 2,607 | BigDecimal.js |
| Subtract | 72,754 | 18,190 | 88.47 | BigDecimal.js |
| Divide | 15,123 | 1,122 | 658 | BigDecimal.js |
| Abs | 751,232 | 1,405,722 | 13,732 | Big.js |
| Compare | 529,009 | 1,152,995 | 1,010,368 | Big.js |
| Remainder | 9,705 | 3,878 | 2,487 | BigDecimal.js |

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
