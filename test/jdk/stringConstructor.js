'use strict';
const { Big, MC } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('String constructor JDK', function () {

    it('construct with error', function () {
        const testCases = [
            '',
            '+',
            '-',
            '+e',
            '-e',
            'e+',
            '1.-0',
            '.-123',
            '-',
            '--1.1',
            '-+1.1',
            '+-1.1',
            '1-.1',
            '1+.1',
            '1.111+1',
            '1.111-1',
            '11.e+',
            '11.e-',
            '11.e+-',
            '11.e-+',
            '11.e-+1',
            '11.e+-1',
            // These overflow the *scale*: the exponent is negative, so the resulting scale
            // is positive and exceeds Integer.MAX_VALUE.
            '1e-2147483648',
            '10e-2147483648',
            '0.01e-2147483648',
            '1e-2147483649',
        ];

        for (const testCase of testCases) {
            (() => Big(testCase)).should.throw();
        }
    });

    // JDK 19 (JDK-8287376) stopped rejecting exponents outside the int range up front, so
    // that toString() output always parses back: BigDecimal.valueOf(1, Integer.MIN_VALUE)
    // prints '1E+2147483648', whose exponent does not fit an int even though the scale it
    // denotes (Integer.MIN_VALUE) does. What has to fit is the resulting scale. '1e2147483648'
    // was previously pinned in the throwing list above, which encoded the pre-JDK-19 behaviour.
    // Every expectation below is taken from JDK 26.0.1.
    it('exponentOutOfIntRangeButScaleInRangeTest', function () {
        // accepted: the resulting scale fits even though the exponent does not
        Big('1e2147483648').scale().should.equal(-2147483648);
        Big('1E+2147483648').toString().should.equal('1E+2147483648');
        Big('0E+2147483648').scale().should.equal(-2147483648); // zero significand
        Big('1.5E+2147483648').scale().should.equal(-2147483647); // fractional digit offsets the scale
        Big('10E+2147483648').toString().should.equal('1.0E+2147483649'); // renormalised on output
        Big('0.001E+2147483650').scale().should.equal(-2147483647); // exponent well past MAX_INT
        Big('1E-2147483647').scale().should.equal(2147483647); // the positive-scale limit

        // rejected: the resulting scale does not fit
        (() => Big('0.001E+2147483652')).should.throw(RangeError, 'Exponent overflow');
        (() => Big('0.1E-2147483647')).should.throw(RangeError, 'Exponent overflow');
        (() => Big('1E+2147483649')).should.throw(RangeError, 'Exponent overflow');
        (() => Big('1E+9999999999')).should.throw(RangeError, 'Exponent overflow');
        // still rejected earlier, by the exponent-digit cap rather than the scale check
        (() => Big('1E+10000000000')).should.throw(RangeError, 'Too many nonzero exponent digits');

        // MathContext rounding is applied BEFORE the scale is range-checked, so a context
        // that drops enough digits rescues an otherwise out-of-range scale. This is why the
        // check cannot live in adjustScale: at that point the scale is not yet final.
        Big('1.234E-2147483647', undefined, MC(1)).toString().should.equal('1E-2147483647');
        (() => Big('1.234E-2147483647', undefined, MC(2))).should.throw(RangeError, 'Exponent overflow');
    });

    // The guarantee JDK-8287376 exists to provide.
    it('toStringRoundTripsAtScaleExtremesTest', function () {
        for (const scale of [-2147483648, -2147483647, 0, 2147483646, 2147483647]) {
            for (const unscaled of [1n, -1n, 0n, 123456789n, -987654321012345678901234567890n]) {
                const x = Big(unscaled, scale);
                Big(x.toString()).equals(x).should.be.true;
            }
        }
    });

    it('leadingExponentZeroTest', function () {
        const twelve = Big('12');
        const onePointTwo = Big('1.2');

        const start = '1.2e0';
        const end = '1';
        let middle = '';

        // Test with more excess zeros than the largest number of
        // decimal digits needed to represent a long
        const limit = (Math.trunc(Math.log10(9223372036854775807))) + 6;
        for (let i = 0; i < limit; i++, middle += '0') {
            const t1 = start + middle;
            const t2 = t1 + end;

            onePointTwo.equals(Big(t1)).should.be.true;
            twelve.equals(Big(t2)).should.be.true;
        }
    });
});
