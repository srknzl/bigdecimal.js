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
const additionTestCases = require('./additionTestCases.json');
chai.should();

describe('Addition test', function () {

    const invalidTests = [
        [BigDecimal.fromValue('12.345'), undefined],
        [BigDecimal.fromValue('12.345'), null],
        [BigDecimal.fromValue('12.345'), NaN],
        [BigDecimal.fromValue('12.345'), 'NaN'],
        [BigDecimal.fromValue('12.345'), []],
        [BigDecimal.fromValue('12.345'), {}],
        [BigDecimal.fromValue('12.345'), ''],
        [BigDecimal.fromValue('12.345'), ' '],
        [BigDecimal.fromValue('12.345'), 'hello'],
        [BigDecimal.fromValue('12.345'), '\t'],
        [BigDecimal.fromValue('12.345'), Date.fromValue],
        [BigDecimal.fromValue('12.345'), RegExp.fromValue],
        [BigDecimal.fromValue('12.345'), function () {
        }],
        [BigDecimal.fromValue('12.345'), ' 0.1'],
        [BigDecimal.fromValue('12.345'), '7.5 '],
        [BigDecimal.fromValue('12.345'), ' +1.2'],
        [BigDecimal.fromValue('12.345'), ' 0 '],
        [BigDecimal.fromValue('12.345'), '- 99'],
        [BigDecimal.fromValue('12.345'), '9.9.9'],
        [BigDecimal.fromValue('12.345'), '10.1.0'],
        [BigDecimal.fromValue('12.345'), '0x16'],
        [BigDecimal.fromValue('12.345'), '1e'],
        [BigDecimal.fromValue('12.345'), '8 e'],
        [BigDecimal.fromValue('12.345'), '77-e'],
        [BigDecimal.fromValue('12.345'), '123e.0'],
        [BigDecimal.fromValue('12.345'), '4e1.'],
        [BigDecimal.fromValue('12.345'), Infinity],
        [BigDecimal.fromValue('12.345'), '-Infinity'],
    ];

    it('should be able to add two decimals', function () {
        for (const test of additionTestCases) {
            const actual = (BigDecimal.fromValue(test.arguments[0])).add(BigDecimal.fromValue(test.arguments[1])).toString();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' + '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid argument', function () {
        for (const test of invalidTests) {
            (() => {
                test[0].add(test[1]);
            }).should.throw(undefined, undefined, `expected '${test[0]}' + '${test[1]}' to throw`);
        }
    });
});
