'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Predicates test', function () {

    it('should calculate isZero correctly', function () {
        Big('0').isZero().should.be.true;
        Big('0.00').isZero().should.be.true;
        Big('1.5').isZero().should.be.false;
        Big('-1.5').isZero().should.be.false;
        Big('12345678901234567890.123').isZero().should.be.false;
    });

    it('should calculate isPositive correctly', function () {
        Big('1.5').isPositive().should.be.true;
        Big('12345678901234567890.123').isPositive().should.be.true;
        Big('0').isPositive().should.be.false;
        Big('0.00').isPositive().should.be.false;
        Big('-1.5').isPositive().should.be.false;
    });

    it('should calculate isNegative correctly', function () {
        Big('-1.5').isNegative().should.be.true;
        Big('-12345678901234567890.123').isNegative().should.be.true;
        Big('0').isNegative().should.be.false;
        Big('0.00').isNegative().should.be.false;
        Big('1.5').isNegative().should.be.false;
    });
});
