'use strict';
const { Big } = require('big.js');
const Decimal = require('../bigdecimal.js');
const { BigDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('BigNumbersAddMulTest#Bigdecimal.js', function () {
    let res2 = Decimal.fromString('0');
    for (const x of bigDecimals) {
        res2 = res2.add(x);
    }
    for (const x of bigDecimals) {
        res2 = res2.multiply(x);
    }
}).add('BigNumbersAddMulTest#Big.js', function () {
    let res = new Big('0');
    for (const x of bigDecimalsBigjs) {
        res = res.add(x);
    }
    for (const x of bigDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('BigNumbersAddMulTest#GWTBased', function () {
    let res = BigDecimal('0');
    for (const x of bigDecimalsGWT) {
        res = res.add(x);
    }
    for (const x of bigDecimalsGWT) {
        res = res.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target))
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
