'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/precisionTestCases.json');
chai.should();

describe('Precision test', function () {

    it('should calculate Precision correctly', function () {
        for (const test of testCases) {
            const scaleOp = () => {
                return Big(test.args[0]).precision();
            };
            if (test.result === 'errorThrown') {
                scaleOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.precision() to throw`
                );
                continue;
            }
            const actual = scaleOp();
            const expected = Number(test.result);
            actual.should.be.equal(expected, `expected '${test.args[0]}'.precision() to be '${expected}'`);
        }
    });
});
