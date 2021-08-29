'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/numberValueTestCases.json');
chai.should();

describe('NumberValue test', function () {

    it('should calculate numberValue correctly', function () {
        for (const test of testCases) {
            const numberValueOp = () => {
                return Big(test.args[0]).numberValue();
            };
            if (test.result === 'errorThrown') {
                numberValueOp.should.throw(undefined, undefined, `expected '${test.args[0]}' numberValue to throw`);
                continue;
            }
            const actual = numberValueOp();
            const expected = Number(test.result);
            actual.should.be.equal(expected, `expected '${test.args[0]}' numberValue to be '${expected}'`);
        }
    });

    it('should work with numbers outside safe integer range but inside max/min range', function () {
        Big(Number.MAX_VALUE).numberValue().toString().should.be.equal(Number.MAX_VALUE.toString());
        Big(Number.MAX_VALUE).numberValue().should.be.equal(Number.MAX_VALUE);

        Big(Number.MIN_VALUE).numberValue().toString().should.be.equal(Number.MIN_VALUE.toString());
        Big(Number.MIN_VALUE).numberValue().should.be.equal(Number.MIN_VALUE);

        (() => Big(Number.NEGATIVE_INFINITY)).should.throw(RangeError);
        (() => Big(Number.POSITIVE_INFINITY)).should.throw(RangeError);
    });

    it('should throw for numbers outside max/min range', function () {
        (() => Big(-Number.MAX_VALUE * 1.1)).should.throw(RangeError);
        (() => Big(Number.MAX_VALUE * 1.1)).should.throw(RangeError);
        (() => Big(Number.NEGATIVE_INFINITY)).should.throw(RangeError);
        (() => Big(Number.POSITIVE_INFINITY)).should.throw(RangeError);
    });
});
