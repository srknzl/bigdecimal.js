'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('MultiplyTest(Big Numbers)#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue('1');
    for (const x of bigDecimals) {
        res2 = res2.multiply(x);
    }
}).add('MultiplyTest(Big Numbers)#Big.js', function () {
    let res = new Big('1');
    for (const x of bigDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('MultiplyTest(Big Numbers)#GWTBased', function () {
    let res2 = GWTDecimal('1');
    for (const x of bigDecimalsGWT) {
        res2 = res2.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
