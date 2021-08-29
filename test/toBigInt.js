'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/toBigIntTestCases.json');
chai.should();

describe('ToBigInt test', function () {

    it('should calculate ToBigInt correctly', function () {
        for (const test of testCases) {
            const toBigIntOp = () => {
                return Big(test.args[0]).toBigInt().toString();
            };
            if (test.result === 'errorThrown') {
                toBigIntOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.toBigInt() to throw`);
                continue;
            }
            const actual = toBigIntOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.toBigInt() to be '${expected}'`);
        }
    });
});
