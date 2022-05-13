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
        big.toPlainString().should.be.eq("0.00123");

        const big2 = Big(10000000000, 2);
        big2.scale().should.be.eq(2);
        big2.precision().should.be.eq(11);
        should.equal(big2.intVal, null);
        big2.intCompact.should.be.eq(10000000000);
        big2.toPlainString().should.be.eq("100000000.00");

        const big3 = Big(123, -5);
        big3.scale().should.be.eq(-5);
        big3.precision().should.be.eq(3);
        should.equal(big3.intVal, null);
        big3.intCompact.should.be.eq(123);
        big3.toPlainString().should.be.eq("12300000");
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

    it('should build from unsafe number and scale', function () {       
        const big = Big(Number.MAX_SAFE_INTEGER + 1, 1);
        big.scale().should.be.eq(1);
        big.precision().should.be.eq(16);
        should.equal(big.intVal, 9007199254740992n);
        big.intCompact.should.be.eq(Number.MIN_SAFE_INTEGER);
        big.toPlainString().should.be.eq("900719925474099.2");

        const big2 = Big(Number.MAX_SAFE_INTEGER + 1, -1);
        big2.scale().should.be.eq(-1);
        big2.precision().should.be.eq(16);
        should.equal(big2.intVal, 9007199254740992n);
        big2.intCompact.should.be.eq(Number.MIN_SAFE_INTEGER);
        big2.toPlainString().should.be.eq("90071992547409920");
    });

    it('should build from max value', function () {
        const big = Big(Number.MAX_VALUE); // 1.7976931348623157e+308
        big.scale().should.be.eq(-292);
        big.precision().should.be.eq(17);
        should.equal(big.intVal, 17976931348623157n);
        big.intCompact.should.be.eq(Number.MIN_SAFE_INTEGER);
    });

    it('should build from min value', function () {
        const big = Big(Number.MIN_VALUE); // 5e-324
        big.scale().should.be.eq(324);
        big.precision().should.be.eq(1);
        should.equal(big.intCompact, 5);
        should.equal(big.intVal, null);
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
            '9999999999999999999999999.9.9',
            '999999999999999999999999999.e99999999999999999999999999',
            '999999999999999999999999999.e2147483648',
            '.e99999999999999999999999999',
            '.e999999',
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
