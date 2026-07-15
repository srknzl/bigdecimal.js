'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Clamp test', function () {

    it('should return min when below the range', function () {
        Big('-3').clamp('0.5', '10').toString().should.be.equal('0.5');
        Big('-12345678901234567890.123').clamp(0, 10).toString().should.be.equal('0');
    });

    it('should return max when above the range', function () {
        Big('11.5').clamp(0, 10).toString().should.be.equal('10');
        Big('12345678901234567890.123').clamp(0n, 10n).toString().should.be.equal('10');
    });

    it('should return this when within the range', function () {
        const seven = Big('7');
        seven.clamp(0, 10).should.be.equal(seven); // same instance
        Big('0.5').clamp('0.5', '10').toString().should.be.equal('0.5'); // inclusive bounds
        Big('10').clamp('0.5', '10').toString().should.be.equal('10');
    });

    it('should compare by value, ignoring scale', function () {
        Big('0.0').clamp('0', '1').toString().should.be.equal('0.0');
        Big('2.00').clamp('0', '2').toString().should.be.equal('2.00');
    });

    it('should accept all constructor input types', function () {
        Big('5').clamp(Big('1'), Big('9')).toString().should.be.equal('5');
        Big('5').clamp(1n, 9).toString().should.be.equal('5');
    });

    it('should throw RangeError when min is greater than max', function () {
        (() => Big('5').clamp(10, 0)).should.throw(RangeError);
        (() => Big('5').clamp('1.01', '1.00')).should.throw(RangeError);
    });
});
