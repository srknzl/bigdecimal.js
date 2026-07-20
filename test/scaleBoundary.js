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

    // Two different contracts, and they used to be conflated. An out-of-int-range *argument*
    // is rejected outright, because Java types these parameters as `int` and could never
    // receive one. An in-range argument whose *resulting* scale overflows is what checkScale
    // is for, and that path still reports Java's overflow error.
    it('should reject an out-of-int-range setScale argument', function () {
        (() => Big('2').setScale(2200000000, RoundingMode.HALF_UP))
            .should.throw(RangeError, 'out of the 32-bit integer range');
        (() => Big('2').setScale(-2200000000, RoundingMode.HALF_UP))
            .should.throw(RangeError, 'out of the 32-bit integer range');
    });

    // setScale overflows on the *difference* newScale - oldScale, not on newScale itself, so
    // it takes a large negative starting scale to reach. Java throws ArithmeticException here
    // too (reported as "Underflow").
    it('should throw when setScale overflows the scale from an in-range argument', function () {
        (() => Big('1e2000000000').setScale(2000000000, RoundingMode.HALF_UP))
            .should.throw(RangeError, 'Scale too high');
    });

    it('should throw when pow overflows scale (scale * exponent)', function () {
        (() => Big('1e-1000000000').pow(5, MC(0)))
            .should.throw(RangeError, 'Scale too high');
    });

    // Verified against JDK 26.0.1: a zero significand has no digits to lose, so a scale that
    // would overflow is clamped rather than throwing, while the same call on a nonzero value
    // throws. The arguments here are all inside the int range — reaching this path with an
    // out-of-range argument was a JS-only extension and is now rejected up front.
    it('should clamp instead of throwing when the value is zero', function () {
        Big('0').multiply(Big('1e2000000000')).signum().should.be.equal(0);

        const zero = Big(0n, 1000);
        zero.movePointLeft(2147483647).scale().should.be.equal(2147483647);
        zero.movePointLeft(2147483647).signum().should.be.equal(0);
        Big('0').setScale(2147483647).scale().should.be.equal(2147483647);
        Big(0n, -1000).movePointRight(2147483647).scale().should.be.equal(0);

        // the same movePointLeft on a nonzero value overflows instead
        (() => Big(1n, 1000).movePointLeft(2147483647)).should.throw(RangeError);
    });
});
