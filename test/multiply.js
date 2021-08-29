'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/multiplyTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Multiplication test', function () {

    it('should be able to multiplication two decimals', function () {
        for (const test of testCases) {
            const multiplication = () => {
                return Big(test.args[0]).multiply(
                    Big(test.args[1]),
                    new MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                multiplication.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}' * '${test.args[1]}' to throw`
                );
                continue;
            }
            const actual = multiplication();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' * '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].multiply(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' * '${test[1]}' to throw`);
        }
    });
});
