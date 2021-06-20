'use strict';
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('CompareTest(Big Numbers)#Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length -1; i++) {
        bigDecimals[i].compareTo(bigDecimals[i+1]);
    }
}).add('CompareTest(Big Numbers)#Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length -1; i++) {
        bigDecimalsBigjs[i].cmp(bigDecimalsBigjs[i+1]);
    }
}).add('CompareTest(Big Numbers)#GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length -1; i++) {
        bigDecimalsGWT[i].compareTo(bigDecimalsGWT[i+1]);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
