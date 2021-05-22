'use strict';
const { Big } = require('big.js');
const { BigDecimal, MathContext, RoundingMode } = require('../lib/big_decimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '1311112212310789450973450941073120938675409731640122222222222222222222222222222222222222222212323123.123123';
const precision = 123;
Big.DP = precision;
Big.RM = 1;

suite.add('DivideTest(Big Numbers)#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue(initialValue);
    for (const x of bigDecimals) {
        res2 = res2.divide(x, new MathContext(precision, RoundingMode.HALF_UP));
    }
}).add('DivideTest(Big Numbers)#Big.js', function () {
    let res = new Big(initialValue);
    for (const x of bigDecimalsBigjs) {
        res = res.div(x);
    }
}).add('DivideTest(Big Numbers)#GWTBased', function () {
    let res2 = GWTDecimal(initialValue);

    for (const x of bigDecimalsGWT) {
        res2 = res2.divide(x, precision, GWTDecimal.ROUND_HALF_UP);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
