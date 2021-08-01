'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/scaleByPowerOfTenTestCases.json');
chai.should();

describe('ScaleByPowerOfTen test', function () {

    it('should calculate ScaleByPowerOfTen correctly', function () {
        for (const test of testCases) {
            const scaleByPowerOfTenOp = () => {
                return Big(test.args[0]).scaleByPowerOfTen(
                    test.args[1]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                scaleByPowerOfTenOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.scaleByPowerOfTen(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = scaleByPowerOfTenOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.scaleByPowerOfTen(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
