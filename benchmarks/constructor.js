'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const { BigNumber } = require('bignumber.js');
const Decimal = require('decimal.js');
const Benchmark = require('benchmark');
const { bigDecimalsString } = require('./test_numbers');
const { attachEventsAndRun } = require('./utils.js');

const values = [...bigDecimalsString, ...bigDecimalsString.map(v => Number(v))];

const suite = new Benchmark.Suite('Constructor');

suite.add('Bigdecimal.js', function () {
    for (const x of values) {
        Big(x);
    }
}).add('Big.js', function () {
    for (const x of values) {
        BigJs(x);
    }
}).add('BigNumber.js', function () {
    for (const x of values) {
        BigNumber(x);
    }
}).add('decimal.js', function () {
    for (const x of values) {
        Decimal(x);
    }
}).add('GWTBased', function () {
    for (const x of values) {
        GWTDecimal(x);
    }
});

module.exports = attachEventsAndRun(suite);
