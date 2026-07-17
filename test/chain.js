'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
const testCases = require('../util/output/chainTestCases.json');
chai.should();

// Operation-chain differential tests. Each fixture is a token stream describing
// a linear fold (operand, then 2–4 ops applied left to right); Java evaluated it
// in util/batch/Main.java. This replays the identical stream in JS and asserts an
// identical final toString() (or that both throw). The point is intermediate
// results that cross the compact/inflated boundary — the case single-op tests miss.
// Keep this evaluator byte-identical to Main.java's Chain case.
function evalChain(tokens) {
    let acc = Big(tokens[0]);
    let i = 1;
    while (i < tokens.length) {
        const t = tokens[i++];
        switch (t) {
            case 'add': acc = acc.add(Big(tokens[i++])); break;
            case 'sub': acc = acc.subtract(Big(tokens[i++])); break;
            case 'mul': acc = acc.multiply(Big(tokens[i++])); break;
            case 'div': {
                const divisor = Big(tokens[i++]);
                const scale = Number(tokens[i++]);
                const mode = Number(tokens[i++]);
                acc = acc.divide(divisor, scale, mode);
                break;
            }
            case 'neg': acc = acc.negate(); break;
            case 'abs': acc = acc.abs(); break;
            case 'mpl': acc = acc.movePointLeft(Number(tokens[i++])); break;
            case 'mpr': acc = acc.movePointRight(Number(tokens[i++])); break;
            default: throw new Error('Unknown chain op: ' + t);
        }
    }
    return acc.toString();
}

describe('Chain test', function () {
    it('should evaluate operation chains identically to Java', function () {
        for (const test of testCases) {
            const chainOp = () => evalChain(test.args);
            if (test.result === 'errorThrown') {
                chainOp.should.throw(
                    undefined, undefined, `expected chain [${test.args.join(' ')}] to throw`
                );
                continue;
            }
            chainOp().should.be.equal(
                test.result, `expected chain [${test.args.join(' ')}] to be '${test.result}'`
            );
        }
    });
});
