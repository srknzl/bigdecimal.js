'use strict';
const { Big, MC, RoundingMode } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Negate JDK', function () {

    const negateThenRound = (bd, mc) => bd.negate().plus(mc);

    const absThenRound = (bd, mc) => bd.abs().plus(mc);

    const negateTest = (testCases, mc) => {
        for (const testCase of testCases) {
            const bd = testCase[0];
            const neg1 = bd.negate(mc);
            const neg2 = negateThenRound(bd, mc);
            const expected = testCase[1];

            neg1.equals(expected).should.be.true;
            neg1.equals(neg2).should.be.true;

            // Test abs consistency
            const abs = bd.abs(mc);
            const expectedAbs = absThenRound(bd, mc);
            abs.equals(expectedAbs).should.be.true;
        }
    };

    it('negate test', function () {
        const testCasesCeiling = [
            [Big('1.3'), Big('-1')],
            [Big('-1.3'), Big('2')],
        ];

        negateTest(testCasesCeiling, MC(1, RoundingMode.CEILING));

        const testCasesFloor = [
            [Big('1.3'), Big('-2')],
            [Big('-1.3'), Big('1')]
        ];

        negateTest(testCasesFloor, MC(1, RoundingMode.FLOOR));

    });

});
