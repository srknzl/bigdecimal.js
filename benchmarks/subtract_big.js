'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '0';

suite.add('SubtractTest(Big Numbers)#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue(initialValue);
    for (const x of bigDecimals) {
        res2 = res2.subtract(x);
    }
}).add('SubtractTest(Big Numbers)#Big.js', function () {
    let res = new Big(initialValue);
    for (const x of bigDecimalsBigjs) {
        res = res.sub(x);
    }
}).add('SubtractTest(Big Numbers)#GWTBased', function () {
    let res = GWTDecimal(initialValue);
    for (const x of bigDecimalsGWT) {
        res = res.subtract(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
