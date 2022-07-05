'use strict';
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('../test_numbers');
const { attachEventsAndRun } = require('../utils.js');

const suite = new Benchmark.Suite('Abs');

suite.add('Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        x.abs();
    }
}).add('Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        x.abs();
    }
}).add('BigNumber.js', function () {
    for (const x of bigDecimalsBigNumber) {
        x.abs();
    }
}).add('decimal.js', function () {
    for (const x of bigDecimalsDecimal) {
        x.abs();
    }
}).add('GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        x.abs();
    }
});

module.exports = attachEventsAndRun(suite);
