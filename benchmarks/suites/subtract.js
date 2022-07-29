'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const { BigNumber } = require('bignumber.js');
const Decimal = require('decimal.js');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Subtract');

const initialValue = '123033';

let resBigDec = Big(initialValue);
let resBigJs = BigJs(initialValue);
let resBigNumJs = BigNumber(initialValue);
let resDecimalJs = Decimal(initialValue);
let resGWT = GWTDecimal(initialValue);

suite.add('Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        resBigDec = resBigDec.subtract(x);
    }
}).add('Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        resBigJs = resBigJs.sub(x);
    }
}).add('BigNumber.js', function () {
    for (const x of bigDecimalsBigNumber) {
        resBigNumJs = resBigNumJs.minus(x);
    }
}).add('decimal.js', function () {
    for (const x of bigDecimalsDecimal) {
        resDecimalJs = resDecimalJs.sub(x);
    }
}).add('GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        resGWT = resGWT.subtract(x);
    }
});

module.exports = attachEventsAndRun(suite);
