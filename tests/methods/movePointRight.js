'use strict';
const { Big } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/movePointRightTestCases.json');
chai.should();

describe('MovePointRight test', function () {

    it('should calculate MovePointRight correctly', function () {
        for (const test of testCases) {
            const movePointRightOp = () => {
                return Big(test.args[0]).movePointRight(
                    test.args[1]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                movePointRightOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.movePointRight(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = movePointRightOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.movePointRight(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
