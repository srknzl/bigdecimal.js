'use strict';
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

/**
 * Error-contract tests for the scale boundary at the Java int range
 * (Integer.MIN_VALUE .. Integer.MAX_VALUE).
 *
 * `scale` is a 32-bit int. An operation that would push a *nonzero* value's
 * scale past that range throws RangeError ('Scale too high' / 'Scale too less',
 * mirroring Java's ArithmeticException "Overflow"/"Underflow"); a *zero* value
 * has no digits to lose, so its scale is clamped silently instead. These paths
 * sit behind scale magnitudes no random fixture reaches (the generator caps
 * scales in the thousands), so they are exercised explicitly here. checkScale
 * is the shared chokepoint every scale-shifting op routes through.
 */
describe('Scale boundary (Java int range) error contracts', function () {

    it('should throw "Scale too high" when a product scale exceeds Integer.MAX_VALUE', function () {
        // scale = 2e9 + 2e9 = 4e9 > 2147483647
        (() => Big('1e-2000000000').multiply(Big('1e-2000000000')))
            .should.throw(RangeError, 'Scale too high');
    });

    it('should throw "Scale too less" when a product scale falls below Integer.MIN_VALUE', function () {
        // scale = -2e9 + -2e9 = -4e9 < -2147483648
        (() => Big('1e2000000000').multiply(Big('1e2000000000')))
            .should.throw(RangeError, 'Scale too less');
    });

    it('should throw when movePointLeft pushes scale past the int range', function () {
        (() => Big('0.1').movePointLeft(2147483647))
            .should.throw(RangeError, 'Scale too high');
    });

    it('should throw when setScale exceeds the int range on a nonzero value', function () {
        (() => Big('2').setScale(2200000000, RoundingMode.HALF_UP))
            .should.throw(RangeError, 'Scale too high');
    });

    it('should throw when pow overflows scale (scale * exponent)', function () {
        (() => Big('1e-1000000000').pow(5, MC(0)))
            .should.throw(RangeError, 'Scale too high');
    });

    it('should clamp instead of throwing when the value is zero', function () {
        // A zero significand has no digits to lose, so an out-of-range scale is clamped.
        Big('0').multiply(Big('1e2000000000')).signum().should.be.equal(0);
        Big('0').movePointLeft(2200000000).signum().should.be.equal(0);
    });
});
