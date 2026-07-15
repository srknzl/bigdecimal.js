'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/byteValueExactTestCases.json');
chai.should();

describe('ByteValueExact test', function () {

    it('should calculate ByteValueExact correctly', function () {
        for (const test of testCases) {
            const byteValueExactOp = () => {
                return String(Big(test.args[0]).byteValueExact());
            };
            if (test.result === 'errorThrown') {
                byteValueExactOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.byteValueExact() to throw`);
                continue;
            }
            const actual = byteValueExactOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.byteValueExact() to be '${expected}'`);
        }
    });
});
