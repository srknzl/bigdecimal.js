'use strict';
const { Big } = require('big.js');
const { BigDecimal, RoundingMode, MathContext } = require('../lib/big_decimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '112323123.123123';
const precision = 123;
Big.DP = precision;
Big.RM = 1;

suite.add('DivideTest#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue(initialValue);
    for (const x of smallDecimals) {
        res2 = res2.divide(x, new MathContext(precision, RoundingMode.HALF_UP));
    }
}).add('DivideTest#Big.js', function () {
    let res = new Big(initialValue);
    for (const x of smallDecimalsBigjs) {
        res = res.div(x);
    }
}).add('DivideTest#GWTBased', function () {
    let res2 = GWTDecimal(initialValue);

    for (const x of smallDecimalsGWT) {
        res2 = res2.divide(x, precision, GWTDecimal.ROUND_HALF_UP);
    }

}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
