'use strict';
const { Big, MC, MathContext, RoundingMode } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('Sqrt JDK', function () {

    const compare = (a, b, expected) => {
        const result = a.equals(b);
        result.should.be.equal(expected);
    };

    const equalNumerically = (b1, b2) => {
        b1.compareTo(b2).should.be.eq(0);
    };

    it('negative test', function () {
        for (let i = -10; i < 0; i++) {
            for (let j = -5; j < 5; j++) {
                const input = Big(i, j);
                (() => input.sqrt(MathContext.DECIMAL64)).should.throw();
            }
        }
    });

    it('zero test', function () {
        for (let i = -100; i < 100; i++) {
            const expected = Big(0, Math.trunc(i / 2));
            // These results are independent of rounding mode
            compare(Big(0, i).sqrt(MathContext.UNLIMITED), expected, true);
            compare(Big(0, i).sqrt(MathContext.DECIMAL64), expected, true);
        }
    });

    it('even powers of ten test', function () {
        const oneDigitExactly = MC(1, RoundingMode.UNNECESSARY);

        for (let scale = -100; scale <= 100; scale++) {
            const testValue = Big(1, 2 * scale);
            const expectedNumericalResult = Big(1, scale);

            let result;

            equalNumerically(expectedNumericalResult, result = testValue.sqrt(MathContext.DECIMAL64));

            // Can round to one digit of precision exactly
            equalNumerically(expectedNumericalResult, result = testValue.sqrt(oneDigitExactly));

            result.precision().should.be.lessThanOrEqual(1);

            // If rounding to more than one digit, do precision / scale checking...
        }
    });

    it('low precision perfect squares test', function () {
        // For 5^2 through 9^2, if the input is rounded to one digit
        // first before the root is computed, the wrong answer will
        // result. Verify results and scale for different rounding
        // modes and precisions.
        const squaresWithOneDigitRoot = [
            [4, 2],
            [9, 3],
            [25, 5],
            [36, 6],
            [49, 7],
            [64, 8],
            [81, 9],
        ];

        for (const squareAndRoot of squaresWithOneDigitRoot) {
            const square = Big(squareAndRoot[0]);
            const expected = Big(squareAndRoot[1]);

            for (let scale = 0; scale <= 4; scale++) {
                const scaledSquare = square.setScale(scale, RoundingMode.UNNECESSARY);
                const expectedScale = Math.trunc(scale / 2);
                for (let precision = 0; precision <= 5; precision++) {
                    for (let rm = 0; rm < 8; rm++) {
                        const mc = MC(precision, rm);
                        const computedRoot = scaledSquare.sqrt(mc);
                        equalNumerically(expected, computedRoot);
                        const computedScale = computedRoot.scale();
                        if (precision >= expectedScale + 1 && computedScale !== expectedScale) {
                            throw new Error('fail');
                        }
                    }
                }
            }
        }
    });

});
