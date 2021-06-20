'use strict';
const Benchmark = require('benchmark');
const { smallDecimals, smallDecimalsBigjs, smallDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('CompareTest#Bigdecimal.js', function () {
    for (let i = 0; i < smallDecimals.length -1; i++) {
        smallDecimals[i].compareTo(smallDecimals[i+1]);
    }
}).add('CompareTest#Big.js', function () {
    for (let i = 0; i < smallDecimalsBigjs.length -1; i++) {
        smallDecimalsBigjs[i].cmp(smallDecimalsBigjs[i+1]);
    }
}).add('CompareTest#GWTBased', function () {
    for (let i = 0; i < smallDecimalsGWT.length -1; i++) {
        smallDecimalsGWT[i].compareTo(smallDecimalsGWT[i+1]);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
