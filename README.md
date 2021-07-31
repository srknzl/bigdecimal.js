# BigDecimal.js

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  
[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal(arbitrary precision floats) implementation for Node.js. 
This implementation is based on java BigDecimal class. Like java BigDecimal class, it uses big integers internally. This implementation 
is faster than popular big decimal libraries. See [benchmarks results part below](https://github.com/srknzl/bigdecimal.js#benchmark-results) for comparison.

**Note: The library is currently in preview, v1.0.0 will be released soon. API can change in the near future. I appreciate your feedback, thanks.**

## Features

* Faster than other BigDecimal libraries because of native BigInt(for now, benchmarked against `big.js` and `bigdecimal` )
* Simple API that is almost same with Java's [BigDecimal](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/math/BigDecimal.html)
* No dependencies

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

You can use MathContext object to set precision and rounding mode for a specific operation:

```javascript
const { Big, MC, RoundingMode } = require('bigdecimal.js');

const x = Big('1');
const y = Big('3');

const res1 = x.divide(y, MC(3)); // can be used without `new`
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

* bigdecimal.js
* [big.js](https://github.com/MikeMcl/big.js)
* [GWT based BigDecimal](https://github.com/iriscouch/bigdecimal.js)

To run the benchmark run `npm install` and then `npm run benchmark`.

## Benchmark Results

* Update Date: 26 June 2021
* Each operation is run with small numbers and with big numbers using benchmark.js. 
Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source code of benchmarks.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | GWT | Winner |
| --- | --- | --- | --- | --- |
| Add | 611,777 | 415,311 | 12,775 | Bigdecimal.js |
| Add with big numbers | 113,717 | 33,673 | 148 | Bigdecimal.js |
| Multiply | 613,562 | 73,390 | 3,720 | Bigdecimal.js |
| Multiply with big numbers | 231,335 | 1,651 | 80.09 | Bigdecimal.js |
| Subtract | 641,597 | 348,541 | 12,959 | Bigdecimal.js |
| Subtract with big numbers | 98,031 | 32,729 | 158 | Bigdecimal.js |
| Divide | 6,973 | 2,202 | 382 | Bigdecimal.js |
| Divide with big numbers | 12,258 | 822 | 486 | Bigdecimal.js |
| Abs | 1,266,382 | 3,857,749 | 61,296 | Big.js |
| Abs with big numbers | 1,061,946 | 1,670,200 | 8,687 | Big.js |
| Compare | 1,126,781 | 2,317,875 | 369,511 | Big.js |
| Compare with big numbers | 822,355 | 1,454,145 | 552,519 | Big.js |


* For more, check out https://docs.google.com/spreadsheets/d/1KdpW3NyIK5wD-P0f4H72CvizZ9u0B4qeIm2xBqzky-Q/edit?usp=sharing

[npm-image]: https://img.shields.io/npm/v/bigdecimal.js.svg
[npm-url]: https://npmjs.org/package/bigdecimal.js
[downloads-image]: https://img.shields.io/npm/dm/bigdecimal.js.svg
[downloads-url]: https://npmcharts.com/compare/bigdecimal.js?minimal=true
