'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/scaleTestCases.json');
chai.should();

describe('Scale test', function () {

    it('should calculate Scale correctly', function () {
        for (const test of testCases) {
            const scaleOp = () => {
                return Big(test.args[0]).scale();
            };
            if (test.result === 'errorThrown') {
                scaleOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.scale() to throw`
                );
                continue;
            }
            const actual = scaleOp();
            const expected = Number(test.result);
            actual.should.be.equal(expected, `expected '${test.args[0]}'.scale() to be '${expected}'`);
        }
    });
});
