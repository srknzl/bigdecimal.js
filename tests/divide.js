const { BigDecimal, MathContext, RoundingMode } = require('../lib/big_decimal');
const chai = require('chai');
const additionTestCases = require('./divisionTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Division test', function () {

    it('should be able to divide two decimals', function () {
        for (const test of additionTestCases) {
            const actual =
                (BigDecimal.fromValue(test.arguments[0])).divide(
                    BigDecimal.fromValue(test.arguments[1]), new MathContext(
                        test.arguments[2], // precision
                        RoundingMode.HALF_UP // default of big.js
                    )
                ).toString();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' / '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].subtract(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' / '${test[1]}' to throw`);
        }
    });
});
