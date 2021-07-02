'use strict';
const { Big } = require('../../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/numberValueTestCases.json');
chai.should();

describe('NumberValue test', function () {

    it('should calculate numberValue correctly', function () {
        for (const test of testCases) {
            const numberValueOp = () => {
                return Big(test.args[0]).numberValue();
            };
            if (test.result === 'errorThrown') {
                numberValueOp.should.throw(undefined, undefined, `expected '${test.args[0]}' numberValue to throw`);
                continue;
            }
            const actual = numberValueOp();
            const expected = Number(test.result);
            actual.should.be.equal(expected, `expected '${test.args[0]}' numberValue to be '${expected}'`);
        }
    });
});
