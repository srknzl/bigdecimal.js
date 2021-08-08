'use strict';
const { Big, MC, RoundingMode } = require('../../lib/bigdecimal');
const chai = require('chai');
const should = chai.should();

describe('DivideToIntegralValue JDK', function () {

    const divideContextTest = (dividend, divisor, expected, mc) => {
        let result = null;

        try {
            result = dividend.divideToIntegralValue(divisor, mc);
        } catch (e) {
            should.equal(expected, null);
        }

        if (expected !== null) {
            if (result === null) {
                should.equal(expected, null);
            } else {
                result.equals(expected).should.be.true;
            }
        } else {
            should.equal(result, null);
        }
    };

    const divideContextTests = (dividend, divisor, expected, mc) => {
        divideContextTest(dividend, divisor, expected, mc);
        divideContextTest(dividend.negate(), divisor.negate(), expected, mc);

        if (expected !== null) {
            divideContextTest(dividend.negate(), divisor, expected.negate(), mc);
            divideContextTest(dividend, divisor.negate(), expected.negate(), mc);
        }
    };

    const divideContextTestPrecs = (dividend, divisor, quotients) => {
        for (let i = 0; i < quotients.length; i++) {
            let result = null;
            const quotient = quotients[i];

            try {
                result = dividend.divideToIntegralValue(divisor, MC(i, RoundingMode.DOWN));
            } catch (e) {
                should.equal(quotient, null);
            }

            if (quotient !== null) {
                if (result === null) {
                    should.equal(quotient, null);
                } else {
                    result.equals(quotient).should.be.true;
                }
            } else {
                should.equal(result, null);
            }
        }
    };

    it('divide to integral value test', function () {
        // Exact integer quotient should have the same results from
        // the exact divide and dividetoIntegralValue

        // Rounded results

        const moreTestCases = [
            [Big('11003'), Big('10'), Big('1100')],
            [Big('11003'), Big('1e1'), Big('1100.0')],
            [Big('1e9'), Big('1'), Big('1e9')],
            [Big('1e9'), Big('1.00'), Big('1e9')],
            [Big('1e9'), Big('0.1'), Big('1e10')],
            [Big('10e8'), Big('0.1'), Big('10e9')],
            [Big('400e1'), Big('5'), Big('80e1')],
            [Big('400e1'), Big('4.999999999'), Big('8e2')],
            [Big('40e2'), Big('5'), Big('8e2')],
            [Big(1, -2147483648), Big(1, -(2147483647 & 0x7fffff00)), Big(1, -256)],
        ];

        for (const testCase of moreTestCases) {
            testCase[0].divideToIntegralValue(testCase[1]).equals(testCase[2]).should.be.true;
        }
    });

    it('divide to integral value rounded test', function () {
        let dividend = Big('11003');
        let divisor = Big('10');
        const quotients = [ // Expected results with precision =
            Big('1100'), // 0
            null, // 1
            Big('11e2'), // 2
            Big('110e1'), // 3
            Big('1100') // 4
        ];
        divideContextTestPrecs(dividend, divisor, quotients);

        dividend = Big('11003');
        divisor = Big('1e1');
        const quotients2 = [ // Expected results with precision =
            Big('1100.0'), // 0
            null, // 1
            Big('11e2'), // 2
            Big('110e1'), // 3
            Big('1100'), // 4
            Big('1100.0'), // 5
        ];
        divideContextTestPrecs(dividend, divisor, quotients2);

        dividend = Big('1230000');
        divisor = Big('100');
        const quotients3 = [ // Expected results with precision =
            Big('12300'), // 0
            null, // 1
            null, // 2
            Big('123e2'), // 3
            Big('1230e1'), // 4
            Big('12300'), // 5
        ];
        divideContextTestPrecs(dividend, divisor, quotients3);

        dividend = Big('33');
        divisor = Big('3');
        const quotients4 = [ // Expected results with precision =
            Big('11'), // 0
            null, // 1
            Big('11'), // 2
            Big('11'), // 3
        ];
        divideContextTestPrecs(dividend, divisor, quotients4);

        dividend = Big('34');
        divisor = Big('3');
        const quotients5 = [ // Expected results with precision =
            Big('11'), // 0
            null, // 1
            Big('11'), // 2
            Big('11') // 3
        ];
        divideContextTestPrecs(dividend, divisor, quotients5);
    });

    it('divide to integral value scaling test', function () {
        let dividend = Big('123456789000');
        let divisor = Big(1);
        let expected = Big('123456789e3');
        const mc = MC(9, RoundingMode.DOWN);
        divideContextTests(dividend, divisor, expected, mc);

        // 100/3 = 33 remainder 1
        const precisions = [0, 2, 3, 4];
        dividend = Big(100);
        divisor = Big(3);
        expected = Big(33);

        for (let rm = 0; rm < 8; rm++) {
            for (const prec of precisions) {
                divideContextTests(dividend, divisor, expected, MC(prec, rm));
            }
        }

        // 123000/10 = 12300 remainder 0
        dividend = Big(123000);
        divisor = Big(10);
        const precisions1 = [0, 1, 2, 3, 4, 5];
        const expected1 = [
            Big('12300'),
            null,
            null,
            Big('123e2'),
            Big('1230e1'),
            Big('12300')
        ];

        for (let rm = 0; rm < 8; rm++) {
            for (let i = 0; i < precisions1.length; i++) {
                divideContextTests(dividend, divisor, expected1[i], MC(precisions1[i], rm));
            }
        }

        // 123e3/10 = 123e2 remainder 0
        dividend = Big('123e3');
        divisor = Big(10);
        const precisions2 = [0, 1, 2, 3, 4, 5];
        const expected2 = [
            Big('123e2'),
            null,
            null,
            Big('123e2'),
            Big('123e2'),
            Big('123e2')
        ];

        for (let rm = 0; rm < 8; rm++) {
            for (let i = 0; i < precisions1.length; i++) {
                divideContextTests(dividend, divisor, expected2[i], MC(precisions2[i], rm));
            }
        }

        // 123000/1e1 = 12300.0 remainder 0
        dividend = Big('123000');
        divisor = Big('1e1');
        const precisions3 = [0, 1, 2, 3, 4, 5, 6];
        const expected3 = [
            Big('12300.0'),
            null,
            null,
            Big('123e2'),
            Big('1230e1'),
            Big('12300'),
            Big('12300.0')
        ];

        for (let rm = 0; rm < 8; rm++) {
            for (let i = 0; i < precisions1.length; i++) {
                divideContextTests(dividend, divisor, expected3[i], MC(precisions3[i], rm));
            }
        }
    });

});
