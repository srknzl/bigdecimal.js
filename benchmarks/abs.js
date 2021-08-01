'use strict';
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('AbsTest#Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        x.abs();
    }
}).add('AbsTest#Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        x.abs();
    }
}).add('AbsTest#GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        x.abs();
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
