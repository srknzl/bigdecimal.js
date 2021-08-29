'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/toStringTestCases.json');
chai.should();

describe('ToString test', function () {

    it('should calculate toString correctly', function () {
        for (const test of testCases) {
            const toStringOp = () => {
                return Big(BigInt(test.args[0]), test.args[1], new MC(test.args[2], test.args[3])).toString();
            };
            if (test.result === 'errorThrown') {
                toStringOp.should.throw(undefined, undefined, `expected '${test.args[0]}'.toString() to throw`);
                continue;
            }
            const actual = toStringOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.toString() to be '${expected}'`);
        }
    });
});
