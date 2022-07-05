'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const { BigNumber } = require('bignumber.js');
const Decimal = require('decimal.js');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Remainder');

const initialValue = '11232222312399712313123.123123';

const resBigDec = Big(initialValue);
const resBigJs = BigJs(initialValue);
const resBigNumJs = BigNumber(initialValue);
const resDecimalJs = Decimal(initialValue);
const resGWT = GWTDecimal(initialValue);

suite.add('Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        resBigDec.remainder(x);
    }
}).add('Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        resBigJs.mod(x);
    }
}).add('BigNumber.js', function () {
    for (const x of bigDecimalsBigNumber) {
        resBigNumJs.mod(x);
    }
}).add('decimal.js', function () {
    for (const x of bigDecimalsDecimal) {
        resDecimalJs.mod(x);
    }
}).add('GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        resGWT.remainder(x);
    }
});

module.exports = attachEventsAndRun(suite);
