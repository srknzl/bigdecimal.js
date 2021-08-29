'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/plusTestCases.json');
chai.should();

describe('Plus test', function () {

    it('should calculate plus correctly', function () {
        for (const test of testCases) {
            const plusOp = () => {
                return Big(test.args[0]).plus(
                    new MC(test.args[1], test.args[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                plusOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.plus() to throw`);
                continue;
            }
            const actual = plusOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.plus() to be '${expected}'`);
        }
    });
});
