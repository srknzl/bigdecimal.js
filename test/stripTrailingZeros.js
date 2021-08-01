'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/stripTrailingZerosTestCases.json');
chai.should();

describe('StripTrailingZeros test', function () {

    it('should calculate StripTrailingZeros correctly', function () {
        for (const test of testCases) {
            const stripTrailingZerosOp = () => {
                return Big(test.args[0]).stripTrailingZeros().toString();
            };
            if (test.result === 'errorThrown') {
                stripTrailingZerosOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.stripTrailingZeros() to throw`);
                continue;
            }
            const actual = stripTrailingZerosOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.stripTrailingZeros() to be '${expected}'`);
        }
    });
});
