# BigDecimal.js

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal(arbitrary precision floats) implementation for Node.js. 
This implementation is based on java BigDecimal class. Like java BigDecimal class, it uses big integers internally. This implementation 
is faster than popular big decimal libraries. See [benchmarks results part below](https://github.com/srknzl/bigdecimal.js#benchmark-results) for comparison.

**Note: This release is a preview release, and the package is currently in active development. API can change in the near future. I appreciate your feedback, thanks.**

## Features

* Faster than other BigDecimal libraries because of native BigInt(for now, benchmarked against `big.js` and `bigdecimal` )
* Simple API that is exactly same with Java's [BigDecimal](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/math/BigDecimal.html)
* No dependencies

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
import { Big, MathContext, RoundingMode } from './index';

const x = Big('1');
const y = Big('3');

const res1 = x.divide(y, new MathContext(3));
console.log(res1.toString()); // 0.333

const res2 = x.divide(y, new MathContext(3, RoundingMode.UP));
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

* Update Date: 26.06.2021
* Each operation is run with small numbers and with big numbers using benchmark.js. 
Check out [benchmarks folder](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) for source.
* Operations per second(op/s):

| Operation | Bigdecimal.js | Big.js | GWT |
| --- | --- | --- | --- |
| Add | 611777 | 415311 | 12775 |
| Add with big numbers | 113717 | 33673 | 148 |
| Multiply | 613562 | 73390 | 3720 |
| Multiply with big numbers | 231335 | 1651 | 80.09 |
| Subtract | 641597 | 348541 | 12959 |
| Subtract with big numbers | 98031 | 32729 | 158 |
| Divide | 6973 | 2202 | 382 |
| Divide with big numbers | 12258 | 822 | 486 |
| Abs | 1266382 | 3857749 | 61296 |
| Abs with big numbers | 1061946 | 1670200 | 8687 |
| Compare | 1126781 | 2317875 | 369511 |
| Compare with big numbers | 822355 | 1454145 | 552519 |


* For more, check out https://docs.google.com/spreadsheets/d/1KdpW3NyIK5wD-P0f4H72CvizZ9u0B4qeIm2xBqzky-Q/edit?usp=sharing
