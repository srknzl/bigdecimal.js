'use strict';
const { Big, MC } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/divideTestCases.json');
const testCases2 = require('../util/output/divide2TestCases.json');
const testCases3 = require('../util/output/divide3TestCases.json');
const testCases4 = require('../util/output/divide4TestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Division test', function () {

    it('should be able to divide two decimals', function () {
        for (const test of testCases) {
            const division = () => {
                return Big(test.args[0]).divideWithMathContext(
                    Big(test.args[1]),
                    new MC(test.args[2], test.args[3])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test.args[0]}' / '${test.args[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' / '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should be able to divide two decimals 2', function () {
        for (const test of testCases2) {
            const division = () => {
                return Big(test.args[0]).divide(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test.args[0]}' / '${test.args[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' / '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should be able to divide two decimals 3', function () {
        for (const test of testCases3) {
            const division = () => {
                return Big(test.args[0]).divide(
                    Big(test.args[1]),
                    undefined,
                    test.args[2]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test.args[0]}' / '${test.args[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' / '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should be able to divide two decimals 4', function () {
        for (const test of testCases4) {
            const division = () => {
                return Big(test.args[0]).divide(
                    Big(test.args[1]),
                    test.args[2],
                    test.args[3]
                ).toString();
            };
            if (test.result === 'errorThrown') {
                division.should.throw(undefined, undefined, `expected '${test.args[0]}' / '${test.args[1]}' to throw`);
                continue;
            }
            const actual = division();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.args[0]}' / '${test.args[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].divide(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' / '${test[1]}' to throw`);
        }
    });

});
