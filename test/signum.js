'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/signumTestCases.json');
chai.should();

describe('Signum test', function () {

    it('should calculate signum correctly', function () {
        for (const test of testCases) {
            const signumOp = () => {
                return Big(test.args[0]).signum();
            };
            if (test.result === 'errorThrown') {
                signumOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.signum() to throw`);
                continue;
            }
            const actual = signumOp();
            const expected = Number(test.result);
            actual.should.be.equal(expected, `expected '${test.args[0]}'.signum() to be '${expected}'`);
        }
    });
});
