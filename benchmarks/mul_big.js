/*
  Copyright (c) 2021 Serkan Özel, Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';
const { Big } = require('big.js');
const Decimal = require('../bigdecimal.js');
const { BigDecimal } = require('bigdecimal');
const Benchmark = require('benchmark');
const { bigDecimals, bigDecimalsBigjs, bigDecimalsGWT } = require('./test_numbers');

const suite = new Benchmark.Suite;

suite.add('BigNumbersMultiplyTest#Bigdecimal.js', function () {
    let res2 = Decimal.fromString('1');
    for (const x of bigDecimals) {
        res2 = res2.multiply(x);
    }
}).add('BigNumbersMultiplyTest#Big.js', function () {
    let res = new Big('1');
    for (const x of bigDecimalsBigjs) {
        res = res.mul(x);
    }
}).add('BigNumbersMultiplyTest#GWTBased', function () {
    let res2 = BigDecimal('1');
    for (const x of bigDecimalsGWT) {
        res2 = res2.multiply(x);
    }
}).on('cycle', function (event) {
    console.log(String(event.target))
}).on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run();
