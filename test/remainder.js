'use strict';
const { Big, MC } = require('../lib/bigdecimal');
const chai = require('chai');
const testCases = require('../util/output/remainderTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Remainder test', function () {

    it('should be able to find remainder of two decimals', function () {
        for (const test of testCases) {
            const remainderOp = () => {
                return Big(test.args[0]).remainder(
                    Big(test.args[1]),
                    MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                remainderOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.remainder(${test.args[1]})' to throw`
                );
                continue;
            }
            const actual = remainderOp();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}'.remainder('${test.args[1]}') to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].remainder(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}'.remainder('${test[1]}') to throw`);
        }
    });
});
