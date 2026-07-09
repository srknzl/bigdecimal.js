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

    it('should accept number, string and bigint arguments', function () {
        Big('2.5').min(3).toString().should.be.equal('2.5');
        Big('2.5').min('2.4').toString().should.be.equal('2.4');
        Big('2.5').min(BigInt(2)).toString().should.be.equal('2');
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].min(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' min '${test[1]}' to throw`);
        }
    });
});
