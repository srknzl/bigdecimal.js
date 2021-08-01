'use strict';
const { Big } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/toEngineeringStringTestCases.json');
chai.should();

describe('ToEngineeringString test', function () {

    it('should calculate ToEngineeringString correctly', function () {
        for (const test of testCases) {
            const toEngineeringStringOp = () => {
                return Big(test.args[0]).toEngineeringString();
            };
            if (test.result === 'errorThrown') {
                toEngineeringStringOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.toEngineeringString() to throw`
                );
                continue;
            }
            const actual = toEngineeringStringOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.toEngineeringString() to be '${expected}'`);
        }
    });
});
