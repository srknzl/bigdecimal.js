'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('MultiplyTest#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue('1');
    for (const x of smallDecimals) {
        res2 = res2.multiply(x);
    }
}).add('MultiplyTest#Big.js', function () {
    let res = new Big('1');
    for (const x of smallDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('MultiplyTest#GWTBased', function () {
    let res2 = GWTDecimal('1');
    for (const x of smallDecimalsGWT) {
        res2 = res2.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
