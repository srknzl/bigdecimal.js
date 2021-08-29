'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/powTestCases.json');
chai.should();

describe('Pow test', function () {

    it('should calculate pow correctly', function () {
        this.timeout(100000); // long test
        for (const test of testCases) {
            const powOp = () => {
                return Big(test.args[0]).pow(
                    test.args[1],
                    new MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                powOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.pow() to throw`);
                continue;
            }
            const actual = powOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.pow(${test.args[1]},
             new MC(${test.args[2]}, ${test.args[3]})) to be '${expected}'`);
        }
    });
});
