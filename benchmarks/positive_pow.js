'use strict';
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const suite = new Benchmark.Suite('Positive pow');

const exponents = [0, 1, 2, 10, 99];
const length = exponents.length;

suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].pow(exponents[i%length]);
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].pow(exponents[i%length]);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].pow(exponents[i%length]);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].pow(exponents[i%length]);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].pow(exponents[i%length]);
    }
});

module.exports = attachEventsAndRun(suite);
