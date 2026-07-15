'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/intValueExactTestCases.json');
chai.should();

describe('IntValueExact test', function () {

    it('should calculate IntValueExact correctly', function () {
        for (const test of testCases) {
            const intValueExactOp = () => {
                return String(Big(test.args[0]).intValueExact());
            };
            if (test.result === 'errorThrown') {
                intValueExactOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.intValueExact() to throw`);
                continue;
            }
            const actual = intValueExactOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.intValueExact() to be '${expected}'`);
        }
    });
});
