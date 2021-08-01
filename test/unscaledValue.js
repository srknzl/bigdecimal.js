'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/unscaledValueTestCases.json');
chai.should();

describe('UnscaledValue test', function () {

    it('should calculate UnscaledValue correctly', function () {
        for (const test of testCases) {
            const unscaledValueOp = () => {
                return Big(test.args[0]).unscaledValue().toString();
            };
            if (test.result === 'errorThrown') {
                unscaledValueOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.unscaledValue() to throw`
                );
                continue;
            }
            const actual = unscaledValueOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.unscaledValue() to be '${expected}'`);
        }
    });
});
