'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
// toJSON() is defined to be identical to toPlainString(), so we reuse the
// Java-verified toPlainString cases as the source of truth. The `null` case is
// toJSON-specific (it exercises JSON.stringify passing null straight through).
const testCases = [
    ...require('../util/output/toPlainStringTestCases.json'),
    { args: [null], result: null },
];
chai.should();

describe('ToJSON test', function () {

    it('should calculate ToJSON correctly', function () {
        for (const test of testCases) {
            const toJSONOp = () => {
                const arg = test.args[0];
                const bigdecimalArg = arg === null ? null : Big(arg);
                return {
                    valueOfToJSON: bigdecimalArg === null ? null : bigdecimalArg.toJSON(),
                    valueOfStringify: JSON.stringify(bigdecimalArg),
                    valueOfParseJson: JSON.parse(JSON.stringify({ money: bigdecimalArg })).money,
                }
            };
            if (test.result === 'errorThrown') {
                toJSONOp.should.throw(
                    undefined, undefined, `expected '${test.args[0]}'.toJSON() to throw`
                );
                continue;
            }
            const actual = toJSONOp();
            const expected = JSON.stringify(test.result);

            chai.assert.equal(JSON.stringify(actual.valueOfToJSON), expected, `expected '${JSON.stringify(actual.valueOfToJSON)}' to be '${expected}', The actual value is '${test.args[0]}'.toJSON()`);
            chai.assert.equal(actual.valueOfStringify, expected, `expected '${actual.valueOfStringify}' to be '${expected}', The actual value is JSON.stringify('${test.args[0]}')`);
            chai.assert.equal(JSON.stringify(actual.valueOfParseJson), expected, `expected '${JSON.stringify(actual.valueOfParseJson)}' to be '${expected}', The actual value is JSON.parse('${test.args[0]}')`);
        }
    });
});
