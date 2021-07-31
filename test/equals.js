'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/equalsTestCases.json');
chai.should();

describe('Compare test', function () {

    it('should calculate compareTo correctly', function () {
        for (const test of testCases) {
            const equalsOp = () => {
                return Big(test.args[0]).equals(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                equalsOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.equals(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = equalsOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.equals(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
