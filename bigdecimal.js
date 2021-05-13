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

/*
 Implementation of big decimal with BigInt
*/
class BigDecimal {

    constructor(n) {
        if (n instanceof BigDecimal) {
            this.scale = n.scale;
            this.precision = n.precision;
            this.intVal = n.intVal;
        } else {
            if (typeof n !== 'string') {
                // Convert to string, no need to handle minus zero since BigInt will convert it to 0 anyway
                n = String(n);
            }
            BigDecimal.parseString(this, n);
        }
    }

    static parseExp(value, offset, len) {
        return 0;
    }

    add(other) {
        if(!(other instanceof BigDecimal)){
            other = new BigDecimal(other);
        }
        const scaleDiff = this.scale - other.scale;
        if (scaleDiff === 0) {
            return BigDecimal.fromScalePrecisionBigInt(this.scale, 0, this.intVal + other.intVal);
        } else if (scaleDiff < 0) {
            const bigSum = (this.intVal * (BigInt(10) ** BigInt(-1 * scaleDiff))) + other.intVal;
            return BigDecimal.fromScalePrecisionBigInt(other.scale, 0, bigSum)
        } else {
            const bigSum = (other.intVal * (BigInt(10) ** BigInt(scaleDiff))) + this.intVal;
            return BigDecimal.fromScalePrecisionBigInt(this.scale, 0, bigSum)
        }
    }

    multiply(other) {
        const scale = this.scale + other.scale;
        return new BigDecimal(scale, 0, this.intVal * other.intVal);
    }

    static fromScalePrecisionBigInt(scale, precision, intVal) {
        const instance = new BigDecimal(0);
        instance.scale = scale;
        instance.precision = precision;
        instance.intVal = intVal;
        return instance;
    }

    toString() {
        if (this.scale === 0) {
            return this.intVal.toString();
        }

        if (this.scale < 0) {
            if (this.intVal === BigInt(0)) return '0';
            let str = this.intVal.toString();
            for (let i = 0; i < this.scale; i++) {
                str += '0';
            }
            return str;
        }
        const negative = this.intVal < 0;
        let str = this.intVal.toString();
        let insertionPoint = str.length - this.scale;
        if (insertionPoint === 0) {
            return (negative ? '-0.' : '0.') + str;
        } else if (insertionPoint > 0) {
            let res = '';
            for (let i = 0; i < str.length; i++) {
                if (i === insertionPoint) {
                    res += '.'
                }
                res += str[i];
            }
            return res;
        } else {
            let res = (negative ? '-0.' : '0.');
            for (let i = 0; i < -1 * insertionPoint; i++) {
                res += '0'
            }
            res += str;
            return res;
        }
    }

    static parseString(big, value) {
        let precision = 0;
        let scale = 0;
        let intVal;

        let offset = 0;
        let len = value.length;

        try {
            let isneg = false;
            if (value[offset] === '-') {
                isneg = true;
                offset++;
                len--;
            } else if (value[offset] === '+') {
                offset++;
                len--;
            }
            let dot = false;
            let exp = 0;
            let c;
            let idx = 0;
            if (false) {
                // todo
            } else {
                let coeff = [];
                for (; len > 0; offset++, len--) {
                    c = value[offset];
                    if (c >= '0' && c <= '9') {
                        if (c == '0') {
                            if (precision == 0) {
                                coeff[idx] = c;
                                precision = 1;
                            } else if (idx != 0) {
                                coeff[idx++] = c;
                                precision++;
                            }
                        } else {
                            if (precision != 1 || idx != 0) precision++;
                            coeff[idx++] = c;
                        }
                        if (dot) scale++;
                        continue;
                    }
                    if (c == '.') {
                        if (dot) {
                            throw new Error('Two dots')
                        }
                        dot = true;
                        continue;
                    }
                    if ((c != 'e') && (c != 'E')) {
                        throw new Error('missing exp notation');
                    }
                    exp = BigDecimal.parseExp(value, offset, len);
                    break;
                }
                if (precision == 0) {
                    throw new Error('no digits');
                }
                if (exp != 0) { // had significant exponent
                    // todo
                }
                const stringValue = coeff.join('');

                if (isneg) intVal = BigInt('-' + stringValue)
                else intVal = BigInt(stringValue);
            }
        } catch (error) {
            throw error;
        }
        big.scale = scale;
        big.precision = precision;
        big.intVal = intVal;
    }
}

module.exports = BigDecimal;
