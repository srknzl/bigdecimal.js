/*
  Copyright (c) 2021 Serkan Özel. All Rights Reserved.

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
const { BigDecimal } = require('../../lib/big_decimal');
const chai = require('chai');
const additionTestCases = require('./multiplicationTestCases.json');
const invalidTests = require('../invalidTests');
chai.should();

describe('Multiplication test', function () {

    it('should be able to multiplication two decimals', function () {
        for (const test of additionTestCases) {
            const actual = (BigDecimal.fromValue(test.arguments[0])).multiply(BigDecimal.fromValue(test.arguments[1])).toString();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' * '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].multiply(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' * '${test[1]}' to throw`);
        }
    });
});
