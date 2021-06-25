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
