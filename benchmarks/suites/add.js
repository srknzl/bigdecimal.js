'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../../lib/bigdecimal.js');
const { BigNumber } = require('bignumber.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const Decimal = require('decimal.js');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Add');

const initialValue = '0';

let resBigDec = Big(initialValue);
let resBigJs = BigJs(initialValue);
let resBigNumJs = BigNumber(initialValue);
let resDecimalJs = Decimal(initialValue);
let resGWT = GWTDecimal(initialValue);

suite.add('Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        resBigDec = resBigDec.add(x);
    }
}).add('Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        resBigJs = resBigJs.add(x);
    }
}).add('BigNumber.js', function () {
    for (const x of bigDecimalsBigNumber) {
        resBigNumJs = resBigNumJs.plus(x);
    }
}).add('decimal.js', function () {
    for (const x of bigDecimalsDecimal) {
        resDecimalJs = resDecimalJs.plus(x);
    }
}).add('GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        resGWT = resGWT.add(x);
    }
});

module.exports = attachEventsAndRun(suite);
