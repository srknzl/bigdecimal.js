'use strict';
const { Big } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('Precision JDK', function () {

    const testPrecision = (bd, expected) => {
        const precision = bd.precision();
        precision.should.be.eq(expected);
    };

    it('precision test', function () {

        // Smallest and largest values of a given length
        const testValues = [Big(1), Big(9)];

        testPrecision(Big(0), 1);

        for (let i = 1; i < 100; i++) {
            for (const bd of testValues) {
                try {
                    testPrecision(bd, i);
                } catch (e) {
                    console.error(e);
                }
                testPrecision(bd.negate(), i);
            }

            testValues[0] = testValues[0].multiply(Big(10));
            testValues[1] = testValues[1].multiply(Big(10)).add(Big(9));
        }

        // The following test tries to cover testings for precision of long values
        const randomTestValues = [
            Big(2147483648), // 2^31:       10 digits
            Big(-2147483648), // -2^31:      10 digits
            Big(98893745455), // random:     11 digits
            Big(3455436789887), // random:     13 digits
            Big(140737488355328), // 2^47:       15 digits
            Big(-140737488355328), // -2^47:      15 digits
            Big(7564232235739573), // random:     16 digits
            Big(25335434990002322), // random:     17 digits
            Big(9223372036854775807), // 2^63 - 1:   19 digits
            Big(-9223372036854775807) // -2^63 + 1:  19 digits
        ];
        // The array below contains the expected precision of the above numbers
        const expectedPrecision = [10, 10, 11, 13, 15, 15, 16, 17, 19, 19];
        for (let i = 0; i < randomTestValues.length; i++) {
            testPrecision(randomTestValues[i], expectedPrecision[i]);
        }
    });

});
