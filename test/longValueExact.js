'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/longValueExactTestCases.json');
chai.should();

describe('LongValueExact test', function () {

    it('should calculate LongValueExact correctly', function () {
        for (const test of testCases) {
            const longValueExactOp = () => {
                return Big(test.args[0]).longValueExact().toString();
            };
            if (test.result === 'errorThrown') {
                longValueExactOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.longValueExact() to throw`);
                continue;
            }
            const actual = longValueExactOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.longValueExact() to be '${expected}'`);
        }
    });
});
