'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/absTestCases.json');
chai.should();

describe('Absolute value test', function () {

    it('should calculate abs correctly', function () {
        for (const test of testCases) {
            const absOp = () => {
                return Big(test.args[0]).abs(
                    new MC(test.args[1], test.args[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                absOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.abs() to throw`);
                continue;
            }
            const actual = absOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.abs() to be '${expected}'`);
        }
    });
});
