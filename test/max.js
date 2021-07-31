'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/maxTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Max test', function () {

    it('should calculate max correctly', function () {
        for (const test of testCases) {
            const maxOp = () => {
                return Big(test.args[0]).max(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                maxOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.max(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = maxOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.max(${test.args[1]}) to be '${expected}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].max(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' max '${test[1]}' to throw`);
        }
    });
});
