'use strict';
const { Big, MC, RoundingMode, MathContext } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

// Argument-validation error contracts (RangeError catalog documented in
// website/guide/error-handling.md). These throw paths are not reachable from
// the Java-differential fixtures — the generator only emits valid precisions
// and rounding modes — so they are asserted directly here.
describe('Argument validation', function () {

    it('MathContext rejects negative precision', function () {
        (() => MC(-1)).should.throw(RangeError, 'MathContext precision cannot be less than 0');
    });

    it('MathContext rejects an invalid rounding mode', function () {
        (() => MC(5, 99)).should.throw(RangeError, 'RoundingMode is invalid');
    });

    // A non-integral precision used to reach the precision-reduction loops in round()/sqrt(),
    // which step by whole digits and so never converge on a fractional target — they spun
    // forever. Asserting the constructor throws is both the fix's contract and a safe
    // regression guard: if the guard is dropped this fails immediately rather than hanging.
    it('MathContext rejects a non-integer precision', function () {
        (() => MC(1.5)).should.throw(RangeError, 'MathContext precision must be an integer');
        (() => MC(NaN)).should.throw(RangeError, 'MathContext precision must be an integer');
        (() => MC(Infinity)).should.throw(RangeError, 'MathContext precision must be an integer');
        (() => MC(-Infinity)).should.throw(RangeError, 'MathContext precision must be an integer');
    });

    it('MathContext rejects a precision beyond the 32-bit integer range', function () {
        (() => MC(2147483648)).should.throw(RangeError, 'out of the 32-bit integer range');
        (() => MC(1e30)).should.throw(RangeError, 'out of the 32-bit integer range');
    });

    it('MathContext accepts valid integer precisions', function () {
        MC(0).precision.should.equal(0);
        MC(2147483647).precision.should.equal(2147483647);
    });

    // A NaN or fractional scale used to reach the string layout and emit malformed output such
    // as Big(1n, NaN) -> '1ENaN', and left scale() returning a non-integer.
    it('construction rejects a non-integer scale', function () {
        (() => Big(1n, NaN)).should.throw(RangeError, 'Scale must be an integer');
        (() => Big(1n, 1.5)).should.throw(RangeError, 'Scale must be an integer');
        (() => Big(123n, 2.9)).should.throw(RangeError, 'Scale must be an integer');
        (() => Big(1, Infinity)).should.throw(RangeError, 'Scale must be an integer');
    });

    it('construction rejects a scale beyond the 32-bit integer range', function () {
        (() => Big(1n, 2147483648)).should.throw(RangeError, 'out of the 32-bit integer range');
        (() => Big(1n, -2147483649)).should.throw(RangeError, 'out of the 32-bit integer range');
    });

    it('construction accepts valid integer scales', function () {
        Big(1n, 0).scale().should.equal(0);
        Big(123n, 2).toString().should.equal('1.23');
        Big(123n, -2).scale().should.equal(-2);
    });

    it('shared MathContext constants are frozen', function () {
        Object.isFrozen(MathContext.UNLIMITED).should.equal(true);
        Object.isFrozen(MathContext.DECIMAL32).should.equal(true);
        Object.isFrozen(MathContext.DECIMAL64).should.equal(true);
        Object.isFrozen(MathContext.DECIMAL128).should.equal(true);
        // sanity: a frozen constant keeps its value even if a caller assigns to it
        try {
            MathContext.UNLIMITED.precision = 99;
        } catch (ignored) { /* strict mode throws */ }
        MathContext.UNLIMITED.precision.should.equal(0);
    });

    it('constructor rejects sign-only strings', function () {
        (() => Big('-')).should.throw(RangeError, 'No digits found');
        (() => Big('+')).should.throw(RangeError, 'No digits found');
        // > MAX_COMPACT_DIGITS chars forces the non-compact parse path
        (() => Big('.e00000000000000001')).should.throw(RangeError, 'No digits found');
    });

    it('divide requires a rounding mode when a scale is given', function () {
        (() => Big('1').divide('3', 5)).should.throw(RangeError, 'Rounding mode is necessary');
    });

    it('divide rejects an invalid rounding mode', function () {
        (() => Big('1').divide('3', 5, 99)).should.throw(RangeError, 'Invalid rounding mode');
    });

    it('setScale rejects an invalid rounding mode', function () {
        (() => Big('1').setScale(2, 42)).should.throw(RangeError, 'Invalid rounding mode');
        // valid modes still work at the enum edges
        Big('1.5').setScale(0, RoundingMode.UP).toString().should.equal('2');
        (() => Big('1.5').setScale(0, RoundingMode.UNNECESSARY)).should.throw(RangeError);
    });
});
