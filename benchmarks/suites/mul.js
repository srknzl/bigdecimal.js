'use strict';
const Benchmark = require('benchmark');
const Decimal = require('decimal.js');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Multiply');

/* 
    decimal.js cap the precision to 20 by default. 
    Increasing the precision also slightly increase the performance.
*/
Decimal.set({ precision: 99});


suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].multiply(bigDecimals[i+1]);
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].mul(bigDecimalsBigjs[i+1]);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].multipliedBy(bigDecimalsBigjs[i+1]);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].times(bigDecimalsDecimal[i+1]);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].multiply(bigDecimalsGWT[i+1]);
    }
});

module.exports = attachEventsAndRun(suite);
