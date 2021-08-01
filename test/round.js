'use strict';
const { Big, MC } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/roundTestCases.json');
chai.should();

describe('Round test', function () {

    it('should calculate round correctly', function () {
        for (const test of testCases) {
            const roundOp = () => {
                return Big(test.args[0]).round(
                    new MC(test.args[1], test.args[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                roundOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.round() to throw`);
                continue;
            }
            const actual = roundOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.round() to be '${expected}'`);
        }
    });
});
