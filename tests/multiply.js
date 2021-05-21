const { BigDecimal } = require('../lib/big_decimal');
const chai = require('chai');
const testCases = require('./testCases/multiplicationTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Multiplication test', function () {

    it('should be able to multiplication two decimals', function () {
        for (const test of testCases) {
            const actual = (BigDecimal.fromValue(test.arguments[0])).multiply(BigDecimal.fromValue(test.arguments[1])).toString();
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
