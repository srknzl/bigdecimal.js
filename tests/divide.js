const { BigDecimal, MathContext, RoundingMode } = require('../lib/big_decimal');
const chai = require('chai');
const testCases = require('./testCases/divisionTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Division test', function () {

    it('should be able to divide two decimals', function () {
        for (const [i, test] of testCases.entries()) {
            const division = () => {
                return BigDecimal.fromValue(test.arguments[0]).divide(
                    BigDecimal.fromValue(test.arguments[1]),
                    new MathContext(test.arguments[2], test.arguments[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test[0]}' / '${test[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            try {
                actual.should.be.equal(expected, `expected '${test.arguments[0]}' / '${test.arguments[1]}' to be '${expected}'`);

            } catch (e) {
                console.log(i);
                console.log(e);
                throw e;
            }
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
