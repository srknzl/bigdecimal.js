'use strict';
const { Big, MC, MathContext, RoundingMode } = require('../lib/bigdecimal');
const chai = require('chai');
const { results, value } = require('./divideTestNumbers');
const testCases = require('../util/output/divideTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Division test', function () {
    it('should be able to divide two decimals', function () {
        for (const test of testCases) {
            const division = () => {
                return Big(test.args[0]).divideWithMathContext(
                    Big(test.args[1]),
                    new MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test.args[0]}' / '${test.args[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' / '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].divide(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' / '${test[1]}' to throw`);
        }
    });

    it('mc divide tests from jdk', function () {
        for (let i = 0; i < value.length; i++) {
            for (let j = 0; j < value.length; j++) {
                const v1 = Big(value[i]);
                const v2 = Big(value[j]);
                const res1 = v1.divideWithMathContext(v2, MathContext.DECIMAL64);
                res1.toString().should.be.eq(results[i][j]);
            }
        }
        for (let mpc = 1; mpc < 23; mpc++) {
            for (let i = 0; i < value.length; i++) {
                for (let j = 0; j < value.length; j++) {
                    const v1 = Big(value[i]);
                    const v2 = Big(value[j]);
                    const res1 = v1.divideWithMathContext(v2, new MathContext(mpc, RoundingMode.HALF_EVEN));
                    const res2 = v1.divideWithMathContext(v2, new MathContext(128, RoundingMode.HALF_EVEN))
                        .round(new MathContext(mpc, RoundingMode.HALF_EVEN));

                    res1.equals(res2).should.be.true;
                }
            }
        }
    });

    it('powers of 2 and 5', function () {
        for (let i = 0; i < 6; i++) {
            const powerOf2 = Math.pow(2.0, i);

            for (let j = 0; j < 6; j++) {
                const powerOf5 = Math.pow(5.0, j);

                Big(1).divide(Big(powerOf2 * powerOf5));
                Big(powerOf2).divide(Big(powerOf5));
                Big(powerOf5).divide(Big(powerOf2));
            }
        }
    });

    it('non terminating', function () {
        const primes = [1, 3, 7, 13, 17];
        // For each pair of prime products, verify the ratio of
        // non-equal products has a non-terminating expansion.

        for (let i = 0; i < primes.length; i++) {
            for (let j = i + 1; j < primes.length; j++) {

                for (let m = 0; m < primes.length; m++) {
                    for (let n = m + 1; n < primes.length; n++) {
                        const dividend = primes[i] * primes[j];
                        const divisor = primes[m] * primes[n];

                        if (((dividend / divisor) * divisor) !== dividend) {
                            (() => (Big(dividend).divide(Big(divisor)))).should.throw();
                        }

                    }
                }
            }
        }
    });

    it('proper scale tests', function () {
        const testCases = [
            [Big('1'), Big('5'), Big('2e-1')],
            [Big('1'), Big('50e-1'), Big('2e-1')],
            [Big('10e-1'), Big('5'), Big('2e-1')],
            [Big('1'), Big('500e-2'), Big('2e-1')],
            [Big('100e-2'), Big('5'), Big('20e-2')],
            [Big('1'), Big('32'), Big('3125e-5')],
            [Big('1'), Big('64'), Big('15625e-6')],
            [Big('1.0000000'), Big('64'), Big('156250e-7')],
        ];

        for (const tc of testCases) {
            tc[0].divide(tc[1]).equals(tc[2]).should.be.true;
        }
    });

    it('trailing zero tests', function () {
        const mc = MC(3, RoundingMode.FLOOR);

        const testCases = [
            [Big('19'), Big('100'), Big('0.19')],
            [Big('21'), Big('110'), Big('0.190')],
        ];

        for (const tc of testCases) {
            tc[0].divideWithMathContext(tc[1], mc).equals(tc[2]).should.be.true;
        }
    });

    it('scale rounded divide tests', function () {
        // Tests of the traditional scaled divide under different
        // rounding modes.

        // Encode rounding mode and scale for the divide in a
        // BigDecimal with the significand equal to the rounding mode
        // and the scale equal to the number's scale.

        // {dividend, dividisor, rounding, quotient}
        const a = Big('31415');
        const aMinus = a.negate();
        const b = Big('10000');

        const c = Big('31425');
        const cMinus = c.negate();

        // Ad hoc tests
        const d = Big(BigInt('-37361671119238118911893939591735'), 10);
        const e = Big(BigInt('74723342238476237823787879183470'), 15);

        const testCases = [
            [a, b, Big(RoundingMode.UP, 3), Big('3.142')],
            [aMinus, b, Big(RoundingMode.UP, 3), Big('-3.142')],
            [a, b, Big(RoundingMode.DOWN, 3), Big('3.141')],
            [aMinus, b, Big(RoundingMode.DOWN, 3), Big('-3.141')],
            [a, b, Big(RoundingMode.CEILING, 3), Big('3.142')],
            [aMinus, b, Big(RoundingMode.CEILING, 3), Big('-3.141')],
            [a, b, Big(RoundingMode.FLOOR, 3), Big('3.141')],
            [aMinus, b, Big(RoundingMode.FLOOR, 3), Big('-3.142')],
            [a, b, Big(RoundingMode.HALF_UP, 3), Big('3.142')],
            [aMinus, b, Big(RoundingMode.HALF_UP, 3), Big('-3.142')],
            [a, b, Big(RoundingMode.DOWN, 3), Big('3.141')],
            [aMinus, b, Big(RoundingMode.DOWN, 3), Big('-3.141')],
            [a, b, Big(RoundingMode.HALF_EVEN, 3), Big('3.142')],
            [aMinus, b, Big(RoundingMode.HALF_EVEN, 3), Big('-3.142')],
            [c, b, Big(RoundingMode.HALF_EVEN, 3), Big('3.142')],
            [cMinus, b, Big(RoundingMode.HALF_EVEN, 3), Big('-3.142')],
            [d, e, Big(RoundingMode.HALF_UP, -5), Big(-1, -5)],
            [d, e, Big(RoundingMode.HALF_DOWN, -5), Big(0, -5)],
            [d, e, Big(RoundingMode.HALF_EVEN, -5), Big(0, -5)],
        ];

        for (const tc of testCases) {
            const scale = tc[2].scale();
            const rm = Number(tc[2].unscaledValue());

            const quotient = tc[0].divide(tc[1], scale, rm);
            quotient.equals(tc[3]).should.be.true;
        }

        // 6876282
        const testCases2 = [
            // { dividend, divisor, expected quotient }
            [Big(3090), Big(7), Big(441)],
            [Big('309000000000000000000000'), Big('700000000000000000000'), Big(441)],
            [Big('962.430000000000'), Big('8346463.460000000000'), Big('0.000115309916')],
            [Big('18446744073709551631'), Big('4611686018427387909'), Big(4)],
            [Big('18446744073709551630'), Big('4611686018427387909'), Big(4)],
            [Big('23058430092136939523'), Big('4611686018427387905'), Big(5)],
            [Big('-18446744073709551661'), Big('-4611686018427387919'), Big(4)],
            [Big('-18446744073709551660'), Big('-4611686018427387919'), Big(4)],
        ];

        for (const test of testCases2) {
            const quo = test[0].divide(test[1], undefined, RoundingMode.HALF_UP);
            quo.equals(test[2]).should.be.true;
        }
    });

    it('divide by one test', function () {
        // problematic divisor: one with scale 17
        const one = Big(1).setScale(17);

        const unscaledAndScale = [
            [Number.MAX_SAFE_INTEGER, 17],
            [-Number.MAX_SAFE_INTEGER, 17],
            [Number.MAX_SAFE_INTEGER, 0],
            [-Number.MAX_SAFE_INTEGER, 0],
            [Number.MAX_SAFE_INTEGER, 100],
            [-Number.MAX_SAFE_INTEGER, 100]
        ];

        for (const uas of unscaledAndScale) {
            const unscaled = uas[0];
            const scale = uas[1];

            const noRound = Big(unscaled, scale).divide(one, undefined, RoundingMode.UNNECESSARY);

            const roundDown = Big(unscaled, scale).divide(one, undefined, RoundingMode.DOWN);

            noRound.compareTo(roundDown).should.be.eq(0);
        }
    });
});
