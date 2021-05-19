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

  -------------------------------------------------------
  Copyright © `<2021>` `Michael Mclaughlin`

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/
const { BigDecimal } = require('../../lib/bigdecimal');
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
        let counter = 0;
        for (const test of additionTestCases) {
            counter++;
            if (counter % 100 === 0) console.log(counter);
            const actual = (BigDecimal.fromValue(test.arguments[0])).add(BigDecimal.fromValue(test.arguments[1])).toString();
            const expected = test.result;
            actual.should.be.equal(expected, `expected '${test.arguments[0]}' + '${test.arguments[1]}' to be '${expected}'`);
        }
    });

    it('should throw on invalid usage', function () {
        for (const test of invalidTests) {
            (() => {
                try {
                    test[0].add(test[1]);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }).should.throw(undefined, undefined, `expected '${test[0]}' + '${test[1]}' to throw`);
        }
    });
});
