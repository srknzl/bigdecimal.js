'use strict';
const { Big, MathContext } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/negateTestCases.json');
chai.should();

describe('Negate test', function () {

    it('should calculate negate correctly', function () {
        for (const test of testCases) {
            const negateOp = () => {
                return Big(test.args[0]).negate(
                    new MathContext(test.args[1], test.args[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                negateOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.negate() to throw`);
                continue;
            }
            const actual = negateOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.negate() to be '${expected}'`);
        }
    });
});
