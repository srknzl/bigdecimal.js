'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/ulpTestCases.json');
chai.should();

describe('Ulp test', function () {

    it('should calculate Ulp correctly', function () {
        for (const test of testCases) {
            const ulpOp = () => {
                return Big(test.args[0]).ulp().toString();
            };
            if (test.result === 'errorThrown') {
                ulpOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.ulp() to throw`
                );
                continue;
            }
            const actual = ulpOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.ulp() to be '${expected}'`);
        }
    });
});
