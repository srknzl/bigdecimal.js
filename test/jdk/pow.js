'use strict';
const { Big } = require('../../lib/bigdecimal.js');
const chai = require('chai');
const should = chai.should();

describe('Pow JDK', function () {

    it('zeroAndOne test', function () {
        const testCases = [
            [Big(0, 2147483647), Big(0), Big(1, 0)],
            [Big(0, 2147483647), Big(1), Big(0, 2147483647)],
            [Big(0, 2147483647), Big(2), Big(0, 2147483647)],
            [Big(0, 2147483647), Big(999999999), Big(0, 2147483647)],

            [Big(0, -2147483648), Big(0), Big(1, 0)],
            [Big(0, -2147483648), Big(1), Big(0, -2147483648)],
            [Big(0, -2147483648), Big(2), Big(0, -2147483648)],
            [Big(0, -2147483648), Big(999999999), Big(0, -2147483648)],

            [Big(1, 2147483647), Big(0), Big(1, 0)],
            [Big(1, 2147483647), Big(1), Big(1, 2147483647)],
            [Big(1, 2147483647), Big(2), null], // overflow
            [Big(1, 2147483647), Big(999999999), null], // overflow

            [Big(1, -2147483648), Big(0), Big(1, 0)],
            [Big(1, -2147483648), Big(1), Big(1, -2147483648)],
            [Big(1, -2147483648), Big(2), null], // underflow
            [Big(1, -2147483648), Big(999999999), null], // underflow
        ];

        for (const testCase of testCases) {
            const exponent = testCase[1].numberValue();

            try {
                testCase[0].pow(exponent).equals(testCase[2]).should.be.true;
            } catch (e) {
                should.equal(testCase[2], null);
            }
        }
    });

});
