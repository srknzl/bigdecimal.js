'use strict';
const { Big } = require('../../lib/bigdecimal.js');
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
            '1e-2147483648',
            '10e-2147483648',
            '0.01e-2147483648',
            '1e-2147483649',
            '1e2147483648',
        ];

        for (const testCase of testCases) {
            (() => Big(testCase)).should.throw();
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
