'use strict';
const Benchmark = require('benchmark');
const { Big: BigJs } = require('big.js');
const BigNumber = require('bignumber.js');
const Decimal = require('decimal.js');
const { RoundingMode, MC } = require('../../lib/bigdecimal.js');
const { MathContext } = require('bigdecimal');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Divide');

const precision = 50;
BigJs.DP = precision;
BigNumber.config({DECIMAL_PLACES : precision });
Decimal.set({ precision});

suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].divideWithMathContext(bigDecimals[i+1], MC(precision, RoundingMode.HALF_UP));
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].div(bigDecimalsBigjs[i+1]);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].dividedBy(bigDecimalsBigNumber[i+1]);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].dividedBy(bigDecimalsDecimal[i+1]);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].divide(bigDecimalsGWT[i+1], new MathContext(`precision=${precision} roundingMode=HALF_UP`));
    }
});

module.exports = attachEventsAndRun(suite);
