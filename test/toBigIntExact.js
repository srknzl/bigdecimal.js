'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/toBigIntExactTestCases.json');
chai.should();

describe('ToBigIntExact test', function () {

    it('should calculate ToBigIntExact correctly', function () {
        for (const test of testCases) {
            const toBigIntExactOp = () => {
                return Big(test.args[0]).toBigIntExact().toString();
            };
            if (test.result === 'errorThrown') {
                toBigIntExactOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.toBigIntExact() to throw`);
                continue;
            }
            const actual = toBigIntExactOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.toBigIntExact() to be '${expected}'`);
        }
    });
});
