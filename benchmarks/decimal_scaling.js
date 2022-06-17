'use strict';
const Benchmark = require('benchmark');
const Decimal = require('decimal.js');
const { RoundingMode, MC } = require('../lib/bigdecimal.js');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const suite = new Benchmark.Suite('Decimal scale');

const scales = [10, 1, 0];
const length = scales.length;

suite.add('Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].setScale(scales[i%length], RoundingMode.HALF_UP);
    }
}).add('Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].round(scales[i%length], 1);
    }
}).add('BigNumber.js', function () {
    for (let i = 0; i < bigDecimalsBigNumber.length - 1; i++) {
        bigDecimalsBigNumber[i].decimalPlaces(scales[i%length], Decimal.ROUND_HALF_UP);
    }
}).add('decimal.js', function () {
    for (let i = 0; i < bigDecimalsDecimal.length - 1; i++) {
        bigDecimalsDecimal[i].toDecimalPlaces(scales[i%length], Decimal.ROUND_HALF_UP);
    }
}).add('GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].setScale(scales[i%length], RoundingMode.HALF_UP);
    }
});

module.exports = attachEventsAndRun(suite);
