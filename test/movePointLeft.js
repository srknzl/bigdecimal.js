'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/movePointLeftTestCases.json');
chai.should();

describe('MovePointLeft test', function () {

    it('should calculate MovePointLeft correctly', function () {
        for (const test of testCases) {
            const movePointLeftOp = () => {
                return Big(test.args[0]).movePointLeft(
                    test.args[1]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                movePointLeftOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.movePointLeft(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = movePointLeftOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.movePointLeft(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
