# BigDecimal.js

[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal(arbitrary precision floats) implementation for Node.js. 
This implementation is based on java BigDecimal class. Like java BigDecimal class, it uses big integers internally. This implementation 
is faster than popular big decimal libraries. See [benchmarks section](https://github.com/srknzl/bigdecimal.js#running-benchmarks) for comparison.

**Note: This release is a preview release, and the package is currently in active development. API can change in the near future. I appreciate your feedback, thanks.**

## Features

* Faster than other BigDecimal libraries because of native BigInt(for now, benchmarked against `big.js` and `bigdecimal` )
* Simple API that is exactly same with Java's [BigDecimal](https://docs.oracle.com/en/java/javase/16/docs/api/java.base/java/math/BigDecimal.html)
* No dependencies

## Usage

* The example usage is given below:

```javascript
const { Big } = require('bigdecimal.js');

// Constructor accepts any value such as string and BigDecimal itself:

const x = Big('1.1111111111111111111111');
const y = Big(x);

const z = x.add(y);
console.log(z.toString()); // 2.2222222222222222222222


const u = Big(1.1);
const v = Big(2n);

// You can also construct a BigDecimal from a number or a BigInt:

console.log(u.toString()); // 1.1
console.log(v.toString()); // 2
```

You can use MathContext object to set precision and rounding mode for a specific operation, or while creating a BigDecimal
in case rounding is necessary:

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
