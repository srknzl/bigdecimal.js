'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('JDK-name aliases test', function () {

    const samples = ['0', '1', '-1', '3.9', '-3.9', '4.00', '0.5', '-9007199254740991', '1e30', '123456789.987654321'];

    it('doubleValue should alias numberValue', function () {
        for (const s of samples) {
            Big(s).doubleValue().should.be.equal(Big(s).numberValue());
        }
    });

    it('toBigInteger should alias toBigInt', function () {
        for (const s of samples) {
            Big(s).toBigInteger().should.be.equal(Big(s).toBigInt());
        }
    });

    it('toBigIntegerExact should alias toBigIntExact', function () {
        Big('4.00').toBigIntegerExact().should.be.equal(4n);
        Big('-9007199254740991').toBigIntegerExact().should.be.equal(-9007199254740991n);
        (() => Big('0.5').toBigIntegerExact()).should.throw(RangeError);
        (() => Big('3.9').toBigIntegerExact()).should.throw(RangeError);
    });
});
