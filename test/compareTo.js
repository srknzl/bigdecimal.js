'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/compareToTestCases.json');
const invalidTests = require('./invalidTests');
chai.should();

describe('Compare test', function () {

    it('should calculate compareTo correctly', function () {
        for (const test of testCases) {
            const compareToOp = () => {
                return Big(test.args[0]).compareTo(
                    Big(test.args[1])
                ).toString();
            };
            if (test.result === 'errorThrown') {
                compareToOp.should.throw(
                    undefined,
                    undefined,
                    `expected '${test.args[0]}'.compareTo(${test.args[1]}) to throw`
                );
                continue;
            }
            const actual = compareToOp();
            const expected = test.result;
            actual.should.be.equal(
                expected,
                `expected '${test.args[0]}'.compareTo(${test.args[1]}) to be '${expected}'`
            );
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].compareTo(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' compareTo '${test[1]}' to throw`);
        }
    });

    it('should calculate compareTo aliases correctly', function() {
        const aliasesMap = {
            'sameValue': [0],
            'gt': [1],
            'greaterThan': [1],
            'gte': [0, 1],
            'greaterThanOrEquals': [0, 1],
            'lt': [-1],
            'lowerThan': [-1],
            'lte': [-1, 0],
            'lowerThanOrEquals': [-1, 0]
        };

        Object.entries(aliasesMap).forEach(([alias, associatedReturns]) => {
            for (const test of testCases) {
                const compareToOp = () => Big(test.args[0])[alias](Big(test.args[1]));

                if (test.result === 'errorThrown') {
                    compareToOp.should.throw(
                        undefined,
                        undefined,
                        `expected '${test.args[0]}'.${alias}(${test.args[1]}) to throw`
                    );
                    continue;
                }

                const actual = compareToOp();
                const expected = associatedReturns.includes(Number(test.result));
                actual.should.be.equal(
                    expected,
                    `expected '${test.args[0]}'.${alias}(${test.args[1]}) to be '${expected}'`
                );
            }
        });
    });
});
