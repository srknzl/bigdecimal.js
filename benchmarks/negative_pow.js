'use strict';
const Benchmark = require('benchmark');
const { Big: BigJs } = require('big.js');
const BigNumber = require('bignumber.js');
const Decimal = require('decimal.js');
const { RoundingMode, MC } = require('../lib/bigdecimal.js');
const { MathContext } = require('bigdecimal');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const suite = new Benchmark.Suite('Negative pow');

const precision = 50;
BigJs.DP = precision;
BigNumber.config({DECIMAL_PLACES : precision });
Decimal.set({ precision});

const exponents = [-1, -2, -10, -99];

suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].pow(exponents[i%4], MC(precision, RoundingMode.HALF_UP));
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].pow(exponents[i%4]);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].pow(exponents[i%4]);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].pow(exponents[i%4]);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].pow(exponents[i%4], new MathContext(`precision=${precision} roundingMode=HALF_UP`));
    }
});

module.exports = attachEventsAndRun(suite);
