'use strict';
const { Big } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('CompareTo JDK', function () {

    it('compare to tests', function () {
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

        for (const testCase of testCases) {
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
