'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/big_decimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('BigNumbersAddTest#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue('0');
    for (const x of bigDecimals) {
        res2 = res2.add(x);
    }
}).add('BigNumbersAddTest#Big.js', function () {
    let res = new Big('0');
    for (const x of bigDecimalsBigjs) {
        res = res.add(x);
    }
}).add('BigNumbersAddTest#GWTBased', function () {
    let res = GWTDecimal('0');
    for (const x of bigDecimalsGWT) {
        res = res.add(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target))
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
