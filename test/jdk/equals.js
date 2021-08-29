'use strict';
const { Big } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Equals JDK', function () {

    it('equals test', function () {
        const testValues = [
            [Big(0), Big(0)],
            [Big(1), Big(10)],
            [Big(2147483647), Big(2147483647)],
            [Big(9223372036854775807), Big(-9223372036854775807)],
            [Big(12345678), Big(12345678)],
            [Big(123456789), Big(123456788)],
            [Big('123456789123456789123'), Big(BigInt('123456789123456789123'))],
            [Big('123456789123456789123'), Big(BigInt('123456789123456789124'))],
            [Big(-Number.MAX_SAFE_INTEGER), Big('-9007199254740991')],
            [Big('9007199254740990'), Big(Number.MAX_SAFE_INTEGER)],
            [Big(Math.round(Math.pow(2, 10))), Big('1024')],
            [Big('1020'), Big(Math.pow(2, 11))],
            [Big(BigInt(2) ** BigInt(65)), Big('36893488147419103232')],
            [Big('36893488147419103231.81'), Big('36893488147419103231.811')],
        ];

        for (let i = 0; i < testValues.length; i++) {
            const testPair = testValues[i];
            const result = testPair[0].equals(testPair[1]);
            if (i % 2 === 0) {
                result.should.be.true;
            } else {
                result.should.be.false;
            }
        }
    });

});
