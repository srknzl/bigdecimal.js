'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

const initialValue = '11232222312399712313123.123123';

const resBigDec = Big(initialValue);
const resBigJs = BigJs(initialValue);
const resGWT = GWTDecimal(initialValue);

suite.add('RemainderTest#Bigdecimal.js', function () {
    for (const x of bigDecimals) {
        resBigDec.remainder(x);
    }
}).add('RemainderTest#Big.js', function () {
    for (const x of bigDecimalsBigjs) {
        resBigJs.mod(x);
    }
}).add('RemainderTest#GWTBased', function () {
    for (const x of bigDecimalsGWT) {
        resGWT.remainder(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target));
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
