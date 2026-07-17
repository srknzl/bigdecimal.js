'use strict';
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');
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
