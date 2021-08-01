'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '0';

let resBigDec = Big(initialValue);
let resBigJs = BigJs(initialValue);
let resGWT = GWTDecimal(initialValue);

suite.add('AddTest#Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        resBigDec = resBigDec.add(x);
    }
}).add('AddTest#Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        resBigJs = resBigJs.add(x);
    }
}).add('AddTest#GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        resGWT = resGWT.add(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
