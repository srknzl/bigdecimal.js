const { BigDecimal } = require('../../lib/big_decimal');
const chai = require('chai');
const additionTestCases = require('./additionTestCases.json');
const invalidTests = require('../invalidTests');
chai.should();

describe('Addition test', function () {

    it('should be able to add two decimals', function () {
        for (const test of additionTestCases) {
            const actual = (BigDecimal.fromValue(test.arguments[0])).add(BigDecimal.fromValue(test.arguments[1])).toString();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' + '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].add(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' + '${test[1]}' to throw`);
        }
    });
});
