const { Big, MathContext } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/multiplicationTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Multiplication test', function () {

    it('should be able to multiplication two decimals', function () {
        for (const test of testCases) {
            const multiplication = () => {
                return Big(test.arguments[0]).multiply(
                    Big(test.arguments[1]),
                    new MathContext(test.arguments[2], test.arguments[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                multiplication.should.throw(undefined, undefined, `expected '${test.arguments[0]}' * '${test.arguments[1]}' to throw`);
                continue;
            }
            const actual = multiplication();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' * '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].multiply(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' * '${test[1]}' to throw`);
        }
    });
});
