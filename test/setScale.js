'use strict';
const { Big, RoundingMode } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/setScaleTestCases.json');
chai.should();

describe('SetScale test', function () {

    it('should calculate SetScale correctly', function () {
        for (const test of testCases) {
            const setScaleOp = () => {
                return Big(test.args[0]).setScale(
                    test.args[1],
                    RoundingMode[test.args[2]]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                setScaleOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.setScale(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = setScaleOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.setScale(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
