'use strict';
const { Big } = require('big.js');
const Decimal = require('../bigdecimal.js');
const { BigDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('MultiplyTest#Bigdecimal.js', function () {
    let res2 = BigDecimal2.fromString('1');
    for (const x of smallDecimals) {
        res2 = res2.multiply(x);
    }
}).add('MultiplyTest#Big.js', function () {
    let res = new Big('1');
    for (const x of smallDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('MultiplyTest#GWTBased', function () {
    let res2 = BigDecimal('1');
    for (const x of smallDecimalsGWT) {
        res2 = res2.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target))
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
