'use strict';
const { Big, MC, RoundingMode } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('Add JDK', function () {

    const addWithoutException = (b1, b2, mc = MC(2, RoundingMode.DOWN)) => {
        b1.add(b2, mc);
    };

    const nonExactRoundingModes = [
        RoundingMode.DOWN,
        RoundingMode.HALF_UP,
        RoundingMode.HALF_EVEN,
        RoundingMode.HALF_DOWN,
        RoundingMode.CEILING,
        RoundingMode.FLOOR,
        RoundingMode.UP
    ];

    const roundAway = (b1, b2) => {
        b1.precision();
        b2.precision();

        const b1Negate = b1.negate();
        const b2Negate = b2.negate();

        b1Negate.precision();
        b2Negate.precision();

        roundAway1(b1, b2);
        roundAway1(b1, b2Negate);
        roundAway1(b1Negate, b2);
        roundAway1(b1Negate, b2Negate);
    };

    const roundAway1 = (b1, b2) => {
        roundAway0(b1, b2);
        roundAway0(b2, b1);
    };

    /**
     * Compare b1.add(b2, mc) with b1.add(b2).round(mc) for a variety
     * of MathContexts.
     */
    const roundAway0 = (b1, b2) => {
        const exactSum = b1.add(b2);
        for (let precision = 1; precision < exactSum.precision() + 2; precision++) {
            for (const rm of nonExactRoundingModes) {
                const mc = MC(precision, rm);
                const roundedExactSum = exactSum.round(mc);

                const sum = b1.add(b2, mc);

                if (!roundedExactSum.equals(sum)) {
                    throw new Error('should be equal');
                }
            }
        }
    };

    /**
     * Test for some simple additions, particularly, it will test
     * the overflow case.
     */
    it('simple tests', function () {
        const bd1 = [
            Big(BigInt('7812404666936930160'), 11),
            Big(BigInt('7812404666936930160'), 12),
            Big(BigInt('7812404666936930160'), 13),
        ];
        const bd2 = Big(BigInt('2790000'), 1);
        const expectedResult = [
            Big('78403046.66936930160'),
            Big('8091404.666936930160'),
            Big('1060240.4666936930160'),
        ];
        for (let i = 0; i < bd1.length; i++) {
            !bd1[i].add(bd2).equals(expectedResult[i]).should.be.true;
        }
    });

    /**
     * Test for extreme value of scale and rounding precision that
     * could cause integer overflow in right-shift-into-sticky-bit
     * computations.
     */
    it('extrema tests', function () {
        addWithoutException(Big(1, Number.MIN_SAFE_INTEGER), Big(2, Number.MAX_SAFE_INTEGER));
        addWithoutException(Big(1, -Number.MAX_SAFE_INTEGER), Big(-2, Number.MAX_SAFE_INTEGER));
    });

    /**
     * Test combinations of operands that may meet the condensation
     * criteria when rounded to different precisions.
     */
    it('round gradation tests', function () {
        const params = [
            [Big('1234e100'), Big('1234e97')],
            [Big('1234e100'), Big('1234e96')],
            [Big('1234e100'), Big('1234e95')],
            [Big('1234e100'), Big('1234e94')],
            [Big('1234e100'), Big('1234e93')],
            [Big('1234e100'), Big('1234e92')],
            [Big('1234e100'), Big('1234e50')],
            [Big('1000e100'), Big('1234e97')],
            [Big('1000e100'), Big('1234e96')],
            [Big('1000e100'), Big('1234e95')],
            [Big('1000e100'), Big('1234e94')],
            [Big('1000e100'), Big('1234e93')],
            [Big('1000e100'), Big('1234e92')],
            [Big('1000e100'), Big('1234e50')],
            [Big('1999e100'), Big('1234e97')],
            [Big('1999e100'), Big('1234e96')],
            [Big('1999e100'), Big('1234e95')],
            [Big('1999e100'), Big('1234e94')],
            [Big('1999e100'), Big('1234e93')],
            [Big('1999e100'), Big('1234e92')],
            [Big('1999e100'), Big('1234e50')],
            [Big('9999e100'), Big('1234e97')],
            [Big('9999e100'), Big('1234e96')],
            [Big('9999e100'), Big('1234e95')],
            [Big('9999e100'), Big('1234e94')],
            [Big('9999e100'), Big('1234e93')],
            [Big('9999e100'), Big('1234e92')],
            [Big('9999e100'), Big('1234e50')]
        ];

        for (const param of params) {
            roundAway(param[0], param[1]);
        }
    });

    /**
     * Verify calling the precision method should not change the
     * computed result.
     */
    it('precision consistency test', function () {
        const mc = MC(1, RoundingMode.DOWN);
        const a = Big(1999, -1);

        const sum1 = a.add(Big(1), mc);
        a.precision();
        const sum2 = a.add(Big(1), mc);

        if (!sum1.equals(sum2)) {
            throw new Error('should be equal');
        }
    });

});
