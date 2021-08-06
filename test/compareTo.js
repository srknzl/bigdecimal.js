'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/compareToTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Compare test', function () {

    it('should calculate compareTo correctly', function () {
        for (const test of testCases) {
            const compareToOp = () => {
                return Big(test.args[0]).compareTo(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                compareToOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.compareTo(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = compareToOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.compareTo(${test.args[1]}) to be '${expected}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].compareTo(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' compareTo '${test[1]}' to throw`);
        }
    });

    it('compare to tests from jdk', function () {
        const MINUS_ONE = Big(1).negate();
        const ONE = Big(1);
        const ZERO = Big(0);

        // First operand, second operand, expected compareTo result
        const testCases = [
            // Basics
            [Big(0), Big(0), ZERO],
            [Big(0), Big(1), MINUS_ONE],
            [Big(1), Big(2), MINUS_ONE],
            [Big(2), Big(1), ONE],
            [Big(10), Big(10), ZERO],

            // Significands would compare differently than scaled value
            [Big(2, 1), Big(2), MINUS_ONE],
            [Big(2, -1), Big(2), ONE],
            [Big(1, 1), Big(2), MINUS_ONE],
            [Big(1, -1), Big(2), ONE],
            [Big(5, -1), Big(2), ONE],

            // Boundary and near boundary values
            [Big(Number.MAX_SAFE_INTEGER), Big(Number.MAX_SAFE_INTEGER), ZERO],
            [Big(Number.MAX_SAFE_INTEGER).negate(), Big(Number.MAX_SAFE_INTEGER), MINUS_ONE],

            [Big(Number.MAX_SAFE_INTEGER - 1), Big(Number.MAX_SAFE_INTEGER), MINUS_ONE],
            [Big(Number.MAX_SAFE_INTEGER - 1).negate(), Big(Number.MAX_SAFE_INTEGER), MINUS_ONE],

            [Big(-Number.MAX_SAFE_INTEGER), Big(Number.MAX_SAFE_INTEGER), MINUS_ONE],
            [Big(-Number.MAX_SAFE_INTEGER - 1).negate(), Big(Number.MAX_SAFE_INTEGER), ONE],

            [Big(-Number.MAX_SAFE_INTEGER + 1), Big(Number.MAX_SAFE_INTEGER), MINUS_ONE],
            [Big(-Number.MAX_SAFE_INTEGER + 1).negate(), Big(Number.MAX_SAFE_INTEGER - 1), ZERO],

            [Big(Number.MAX_SAFE_INTEGER), Big(-Number.MAX_SAFE_INTEGER), ONE],
            [Big(Number.MAX_SAFE_INTEGER).negate(), Big(-Number.MAX_SAFE_INTEGER), ZERO],

            [Big(Number.MAX_SAFE_INTEGER - 1), Big(-Number.MAX_SAFE_INTEGER), ONE],
            [Big(Number.MAX_SAFE_INTEGER - 1).negate(), Big(-Number.MAX_SAFE_INTEGER), ONE],

            [Big(-Number.MAX_SAFE_INTEGER), Big(-Number.MAX_SAFE_INTEGER), ZERO],
            [Big(-Number.MAX_SAFE_INTEGER).negate(), Big(-Number.MAX_SAFE_INTEGER), ONE],

            [Big(-Number.MAX_SAFE_INTEGER + 1), Big(-Number.MAX_SAFE_INTEGER), ONE],
            [Big(-Number.MAX_SAFE_INTEGER + 1).negate(), Big(-Number.MAX_SAFE_INTEGER), ONE],
        ];

        for (const [i, testCase] of testCases.entries()) {
            const a = testCase[0];
            const aNegate = a.negate();
            const b = testCase[1];
            const bNegate = b.negate();
            const expected = testCase[2].numberValue();

            a.compareTo(b).should.be.eq(expected);
            aNegate.compareTo(bNegate).should.be.eq(-expected);
        }
    });
});
