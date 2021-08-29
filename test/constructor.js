'use strict';
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');
const chai = require('chai');
const should = chai.should();

describe('Constructor test', function () {

    it('should contruct from bigint', function () {
        const big = Big(123n);
        big.scale().should.be.eq(0);
        big.precision().should.be.eq(3);
        big.intVal.should.be.eq(123n);
        big.intCompact.should.be.eq(123);
    });

    it('should contruct from bigint and scale', function () {
        const big = Big(123n, 3);
        big.scale().should.be.eq(3);
        big.precision().should.be.eq(3);
        should.equal(big.intVal, 123n);
        big.intCompact.should.be.eq(123);
    });

    it('should contruct from bigint, scale and math context', function () {
        const big = Big(123n, 3, MC(5, RoundingMode.HALF_DOWN));
        big.scale().should.be.eq(3);
        big.precision().should.be.eq(3);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(123);
    });

    it('should contruct from bigint and math context', function () {
        const big = Big(123n, undefined, MC(5, RoundingMode.HALF_DOWN));
        big.scale().should.be.eq(0);
        big.precision().should.be.eq(3);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(123);
    });

    it('should contruct from string', function () {
        const big = Big('1.12333e123321');
        big.scale().should.be.eq(-123316);
        big.precision().should.be.eq(6);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(112333);

        const big2 = Big('1000000000000000000000');
        big2.scale().should.be.eq(0);
        big2.precision().should.be.eq(22);
        big2.intVal.should.be.eq(1000000000000000000000n);
        big2.intCompact.should.be.eq(Number.MIN_SAFE_INTEGER);
    });

    it('should contruct from string and math context', function () {
        const big = Big('1.12333e123321', undefined, MC(5, RoundingMode.HALF_DOWN));
        big.scale().should.be.eq(-123317);
        big.precision().should.be.eq(5);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(11233);

        const big2 = Big('100000000000000000000000', undefined, MC(5, RoundingMode.HALF_DOWN));
        big2.scale().should.be.eq(-19);
        big2.precision().should.be.eq(5);
        should.equal(big.intVal, null);
        big2.intCompact.should.be.eq(10000);
    });

    it('should contruct from numbers', function () {
        const big = Big(1.12333123321);
        big.scale().should.be.eq(11);
        big.precision().should.be.eq(12);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(112333123321);

        const big2 = Big(10000000000);
        big2.scale().should.be.eq(0);
        big2.precision().should.be.eq(11);
        should.equal(big2.intVal, null);
        big2.intCompact.should.be.eq(10000000000);

        const big3 = Big(112333123321);
        big3.scale().should.be.eq(0);
        big3.precision().should.be.eq(12);
        should.equal(big3.intVal, null);
        big3.intCompact.should.be.eq(112333123321);
    });

    it('should contruct from an integer and scale', function () {
        const big = Big(123, 5);

        big.scale().should.be.eq(5);
        big.precision().should.be.eq(3);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(123);

        const big2 = Big(10000000000, 2);
        big2.scale().should.be.eq(2);
        big2.precision().should.be.eq(11);
        should.equal(big2.intVal, null);
        big2.intCompact.should.be.eq(10000000000);
    });

    it('should contruct from number and math context', function () {
        const big = Big(1.12333123321, undefined, MC(5, RoundingMode.HALF_DOWN));
        big.scale().should.be.eq(4);
        big.precision().should.be.eq(5);
        should.equal(big.intVal, null);
        big.intCompact.should.be.eq(11233);

        const big2 = Big(10000000000, undefined, MC(5, RoundingMode.HALF_DOWN));
        big2.scale().should.be.eq(-6);
        big2.precision().should.be.eq(5);
        should.equal(big2.intVal, null);
        big2.intCompact.should.be.eq(10000);
    });

    it('should build from unsafe number', function () {
        const big = Big(Number.MAX_SAFE_INTEGER + 1, 1);
        big.scale().should.be.eq(1);
        big.precision().should.be.eq(16);
        should.equal(big.intVal, 9007199254740992n);
        big.intCompact.should.be.eq(Number.MIN_SAFE_INTEGER);
    });

    it('should throw on invalid argument', function () {
        const params = [{}, [], null, undefined, NaN, new Date(), new RegExp(), function () {
        }, Infinity];
        for (const param of params) {
            (() => {
                Big(param);
            }).should.throw();
        }
    });

    it('should throw on invalid string', function () {
        const params = [
            'NaN',
            '',
            ' ',
            'hello',
            '\t',
            ' 0.1',
            '7.5 ',
            ' +1.2',
            ' 0 ',
            '- 99',
            '9.9.9',
            '10.1.0',
            '0x16',
            '1e',
            '8 e',
            '77-e',
            '123e.0',
            '4e1.',
            '-Infinity'
        ];
        for (const param of params) {
            (() => {
                Big(param);
            }).should.throw();
        }
    });

    it('should throw if number is double and scale is given', function () {
        (() => {
            Big(1.12333123321, 1, MC(5, RoundingMode.HALF_DOWN));
        }).should.throw(RangeError);

        (() => {
            Big(1.12333123321, 1);
        }).should.throw(RangeError);
    });

    it('should throw if string and scale is given', function () {
        (() => {
            Big('1.12333123321', 1, MC(5, RoundingMode.HALF_DOWN));
        }).should.throw(RangeError);

        (() => {
            Big('1.12333123321', 1);
        }).should.throw(RangeError);
    });

    it('should throw if number is more than max value or less than min value', function () {
        (() => {
            Big(Infinity);
        }).should.throw(RangeError);

        (() => {
            Big(-Infinity);
        }).should.throw(RangeError);
    });

    it('should throw if number is an integer, scale and math context given', function () {
        (() => {
            Big(112333123321, 1, MC(5, RoundingMode.HALF_DOWN));
        }).should.throw(RangeError);
    });
});
