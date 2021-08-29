'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/divideAndRemainderTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('DivideAndRemainder test', function () {

    it('should be able to divideAndRemainder two decimals', function () {
        for (const test of testCases) {
            const divideAndRemainderOp = () => {
                return Big(test.args[0]).divideAndRemainder(
                    Big(test.args[1]),
                    new MC(test.args[2], test.args[3])
                );
            };
            if (test.result[0] === 'errorThrown') {
                divideAndRemainderOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}' divideAndRemainder '${test.args[1]}' to throw`
                );
                continue;
            }
            const [quotient, remainder] = divideAndRemainderOp();
            quotient.toString().should.be.equal(
                test.result[0],
                `expected quotient of '${test.args[0]}' divided by '${test.args[1]}' to be '${test.result[0]}'`
            );
            remainder.toString().should.be.equal(test.result[1],
                `expected remainder of '${test.args[0]}' divided by '${test.args[1]}' to be '${test.result[1]}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].divideAndRemainder(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' divideAndRemainder '${test[1]}' to throw`);
        }
    });
});
