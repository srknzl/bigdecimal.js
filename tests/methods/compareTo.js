const { Big } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/compareToTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Compare test', function () {

    it('should calculate compareTo correctly', function () {
        for (const test of testCases) {
            const compareToOp = () => {
                return Big(test.arguments[0]).compareTo(
                    Big(test.arguments[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                compareToOp.should.throw(undefined, undefined, `expected '${test.arguments[0]}'.compareTo(${test.arguments[1]}) to throw`);
                continue;
            }
            const actual = compareToOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}'.compareTo(${test.arguments[1]}) to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].compareTo(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' compareTo '${test[1]}' to throw`);
        }
    });
});
