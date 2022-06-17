'use strict';
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const suite = new Benchmark.Suite('Compare');

suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].compareTo(bigDecimals[i + 1]);
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].cmp(bigDecimalsBigjs[i + 1]);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].comparedTo(bigDecimalsBigNumber[i + 1]);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].comparedTo(bigDecimalsDecimal[i + 1]);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].compareTo(bigDecimalsGWT[i + 1]);
    }
});

module.exports = attachEventsAndRun(suite);
