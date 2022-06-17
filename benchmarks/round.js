'use strict';
const Benchmark = require('benchmark');
const { RoundingMode } = require('../lib/bigdecimal.js');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const suite = new Benchmark.Suite('Integer rounding');

suite.add('Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        x.setScale(0, RoundingMode.HALF_UP);
    }
}).add('Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        x.round(0, 1);
    }
}).add('BigNumber.js', function () {
    for (const x of bigDecimalsBigNumber) {
        x.integerValue();
    }
}).add('decimal.js', function () {
    for (const x of bigDecimalsDecimal) {
        x.round();
    }
}).add('GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        x.setScale(0, RoundingMode.HALF_UP);
    }
});

module.exports = attachEventsAndRun(suite);
