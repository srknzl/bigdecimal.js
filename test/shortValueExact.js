'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/shortValueExactTestCases.json');
chai.should();

describe('ShortValueExact test', function () {

    it('should calculate ShortValueExact correctly', function () {
        for (const test of testCases) {
            const shortValueExactOp = () => {
                return String(Big(test.args[0]).shortValueExact());
            };
            if (test.result === 'errorThrown') {
                shortValueExactOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.shortValueExact() to throw`);
                continue;
            }
            const actual = shortValueExactOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.shortValueExact() to be '${expected}'`);
        }
    });
});
