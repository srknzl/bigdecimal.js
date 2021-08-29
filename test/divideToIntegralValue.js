'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/divideToIntegralValueTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('DivideToIntegralValue test', function () {

    it('should be able to divideToIntegralValue two decimals', function () {
        for (const test of testCases) {
            const divideToIntegralValueOp = () => {
                return Big(test.args[0]).divideToIntegralValue(
                    Big(test.args[1]),
                    new MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                divideToIntegralValueOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}' divideToIntegralValue '${test.args[1]}' to throw`
                );
                continue;
            }
            const actual = divideToIntegralValueOp();
            actual.should.be.equal(
                test.result,
                `expected result of '${test.args[0]}' divideToIntegralValue '${test.args[1]}' to be '${test.result}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].divideToIntegralValue(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' divideToIntegralValue '${test[1]}' to throw`);
        }
    });
});
