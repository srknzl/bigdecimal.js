'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/big_decimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('AddMulTest#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue('0');
    for (const x of smallDecimals) {
        res2 = res2.add(x);
    }
    for (const x of smallDecimals) {
        res2 = res2.multiply(x);
    }
}).add('AddMulTest#Big.js', function () {
    let res = new Big('0');
    for (const x of smallDecimalsBigjs) {
        res = res.add(x);
    }
    for (const x of smallDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('AddMulTest#GWTBased', function () {
    let res2 = GWTDecimal('0');
    for (const x of smallDecimalsGWT) {
        res2 = res2.add(x);
    }
    for (const x of smallDecimalsGWT) {
        res2 = res2.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target))
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
