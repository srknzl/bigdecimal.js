'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/toPlainStringTestCases.json');
chai.should();

describe('ToPlainString test', function () {

    it('should calculate ToPlainString correctly', function () {
        for (const test of testCases) {
            const toPlainStringOp = () => {
                return Big(test.args[0]).toPlainString();
            };
            if (test.result === 'errorThrown') {
                toPlainStringOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.toPlainString() to throw`
                );
                continue;
            }
            const actual = toPlainStringOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.toPlainString() to be '${expected}'`);
        }
    });

    it('should print zero with a negative scale as plain 0', function () {
        // signum() === 0 shortcut on the negative-scale path (matches Java: no trailing zeros)
        Big('0e5').toPlainString().should.be.equal('0');
        Big(0n, -7).toPlainString().should.be.equal('0');
    });
});
