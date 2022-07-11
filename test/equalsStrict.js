'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/equalsTestCases.json');
chai.should();

describe('Equals strict test', function () {

    it('should calculate equals correctly', function () {
        for (const test of testCases) {
            const equalsStrictOp = () => {
                return Big(test.args[0]).equalsStrict(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                equalsStrictOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.equals(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = equalsStrictOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.equals(${test.args[1]}) to be '${expected}'`
            );
        }
    });
});
