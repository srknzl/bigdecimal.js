'use strict';
const { Big } = require('big.js');
const { BigDecimal } = require('../lib/big_decimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '0';

suite.add('AddTest#Bigdecimal.js', function () {
    let res2 = BigDecimal.fromValue(initialValue);
    for (const x of smallDecimals) {
        res2 = res2.add(x);
    }
}).add('AddTest#Big.js', function () {
    let res = new Big(initialValue);
    for (const x of smallDecimalsBigjs) {
        res = res.add(x);
    }
}).add('AddTest#GWTBased', function () {
    let res2 = GWTDecimal(initialValue);
    for (const x of smallDecimalsGWT) {
        res2 = res2.add(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
