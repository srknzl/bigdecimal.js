'use strict';
const { Big } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Stripping zero test JDK', function () {

    it('stripping zero test', function () {
        const testCases = [
            [Big('1.00000'), Big('1')],
            [Big('1.000'), Big('1')],
            [Big('1'), Big('1')],
            [Big('0.1234'), Big('0.1234')],
            [Big('0.12340'), Big('0.1234')],
            [Big('0.12340000000'), Big('0.1234')],
            [Big('1234.5678'), Big('1234.5678')],
            [Big('1234.56780'), Big('1234.5678')],
            [Big('1234.567800000'), Big('1234.5678')],
            [Big('0'), Big('0')],
            [Big('0e2'), Big('0')],
            [Big('0e-2'), Big('0')],
            [Big('0e42'), Big('0')],
            [Big('+0e42'), Big('0')],
            [Big('-0e42'), Big('0')],
            [Big('0e-42'), Big('0')],
            [Big('+0e-42'), Big('0')],
            [Big('-0e-42'), Big('0')],
            [Big('0e-2'), Big('0')],
            [Big('0e100'), Big('0')],
            [Big('0e-100'), Big('0')],
            [Big('10'), Big('1e1')],
            [Big('20'), Big('2e1')],
            [Big('100'), Big('1e2')],
            [Big('1000000000'), Big('1e9')],
            [Big('100000000e1'), Big('1e9')],
            [Big('10000000e2'), Big('1e9')],
            [Big('1000000e3'), Big('1e9')],
            [Big('100000e4'), Big('1e9')],
            // BD value which larger than Long.MaxValue
            [Big('1.0000000000000000000000000000'), Big('1')],
            [Big('-1.0000000000000000000000000000'), Big('-1')],
            [Big('1.00000000000000000000000000001'), Big('1.00000000000000000000000000001')],
            [Big('1000000000000000000000000000000e4'), Big('1e34')],
        ];

        for (let i = 0; i < testCases.length; i++) {

            testCases[i][0].stripTrailingZeros().equals(testCases[i][1]).should.be.true;

            testCases[i][0] = testCases[i][0].negate();
            testCases[i][1] = testCases[i][1].negate();

            testCases[i][0].stripTrailingZeros().equals(testCases[i][1]).should.be.true;

        }
    });

});
