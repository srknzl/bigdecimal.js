const { BigDecimal, MathContext } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/absTestCases.json');
chai.should();

describe('Absolute value test', function () {

    it('should calculate abs correctly', function () {
        for (const test of testCases) {
            const absOp = () => {
                return BigDecimal(test.arguments[0]).abs(
                    new MathContext(test.arguments[1], test.arguments[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                absOp.should.throw(undefined, undefined, `expected '${test.arguments[0]}'.abs() to throw`);
                continue;
            }
            const actual = absOp();
            const expected = test.result;
            try{
                actual.should.be.equal(expected, `expected '${test.arguments[0]}'.abs() to be '${expected}'`);
            }catch (e) {
                console.log(e);
            }
        }
    });
});
