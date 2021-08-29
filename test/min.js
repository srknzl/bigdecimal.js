'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/minTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Min test', function () {

    it('should calculate min correctly', function () {
        for (const test of testCases) {
            const minOp = () => {
                return Big(test.args[0]).min(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                minOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.min(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = minOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.min(${test.args[1]}) to be '${expected}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].min(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' min '${test[1]}' to throw`);
        }
    });
});
