'use strict';
const { Big: BigJs } = require('big.js');
const { RoundingMode, MC } = require('../lib/bigdecimal.js');
const { MathContext } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const precision = 50;
BigJs.DP = precision;
BigJs.RM = 1;

suite.add('DivideTest#Bigdecimal.js', function () {
    for (let i = 0; i < bigDecimals.length - 1; i++) {
        bigDecimals[i].divide(bigDecimals[i+1], MC(precision, RoundingMode.HALF_UP));
    }
}).add('DivideTest#Big.js', function () {
    for (let i = 0; i < bigDecimalsBigjs.length - 1; i++) {
        bigDecimalsBigjs[i].div(bigDecimalsBigjs[i+1]);
    }
}).add('DivideTest#GWTBased', function () {
    for (let i = 0; i < bigDecimalsGWT.length - 1; i++) {
        bigDecimalsGWT[i].divide(bigDecimalsGWT[i+1], new MathContext(`precision=${precision} roundingMode=HALF_UP`));
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();

