'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/sqrtTestCases.json');
chai.should();

describe('Sqrt test', function () {

    it('should calculate sqrt correctly', function () {
        this.timeout(100000); // long test
        for (const test of testCases) {
            const sqrtOp = () => {
                return Big(test.args[0]).sqrt(
                    new MC(test.args[1], test.args[2])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                sqrtOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.sqrt() to throw`);
                continue;
            }
            const actual = sqrtOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.sqrt() to be '${expected}'`);
        }
    });
});
