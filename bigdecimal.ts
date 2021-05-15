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

/**
 * Sentinel value for intCompact indicating the
 * significand information is only available from intVal.
 */


declare type BigIntOrNull = BigInt | null;

enum RoundingMode {
    UP,
    DOWN,
    CEILING,
    FLOOR,
    HALF_UP,
    HALF_DOWN,
    HALF_EVEN,
    UNNECESSARY
}

class MathContext {
    readonly precision: number;
    readonly roundingMode: number;

    constructor(setPrecision: number, setRoundingMode: RoundingMode = MathContext.DEFAULT_ROUNDINGMODE) {
        if (setPrecision < 0) {
            throw new RangeError('Digits < 0');
        } else if (setRoundingMode === null) {
            throw new TypeError('null RoundingMode')
        } else {
            this.precision = setPrecision;
            this.roundingMode = setRoundingMode;
        }
    }

    static DEFAULT_ROUNDINGMODE = RoundingMode.HALF_UP;
    static UNLIMITED = new MathContext(0, RoundingMode.HALF_UP);
    static DECIMAL32 = new MathContext(7, RoundingMode.HALF_EVEN);
    static DECIMAL64 = new MathContext(16, RoundingMode.HALF_EVEN);
    static DECIMAL128 = new MathContext(34, RoundingMode.HALF_EVEN)
}

class BigDecimal {

    private readonly intVal: BigIntOrNull;

    private readonly scale: number;

    private precision: number;

    private stringCache: string;

    private static readonly INFLATED = Number.MIN_SAFE_INTEGER;
    private static readonly INFLATED_BIGINT = BigInt(BigDecimal.INFLATED);

    private readonly intCompact: number;
    // All 15-digit base ten strings fit into a safe number; not all 16-digit
    // strings will
    private static readonly MAX_COMPACT_DIGITS = 15;

    private static readonly ZERO_THROUGH_TEN = [
        new BigDecimal(BigInt(0), 0, 0, 1),
        new BigDecimal(BigInt(1), 1, 0, 1),
        new BigDecimal(BigInt(2), 2, 0, 1),
        new BigDecimal(BigInt(3), 3, 0, 1),
        new BigDecimal(BigInt(4), 4, 0, 1),
        new BigDecimal(BigInt(5), 5, 0, 1),
        new BigDecimal(BigInt(6), 6, 0, 1),
        new BigDecimal(BigInt(7), 7, 0, 1),
        new BigDecimal(BigInt(8), 8, 0, 1),
        new BigDecimal(BigInt(9), 9, 0, 1),
        new BigDecimal(BigInt(10), 10, 0, 2),
    ];

    private readonly ZERO_SCALED_BY = [
        BigDecimal.ZERO_THROUGH_TEN[0],
        new BigDecimal(BigInt(0), 0, 1, 1),
        new BigDecimal(BigInt(0), 0, 2, 1),
        new BigDecimal(BigInt(0), 0, 3, 1),
        new BigDecimal(BigInt(0), 0, 4, 1),
        new BigDecimal(BigInt(0), 0, 5, 1),
        new BigDecimal(BigInt(0), 0, 6, 1),
        new BigDecimal(BigInt(0), 0, 7, 1),
        new BigDecimal(BigInt(0), 0, 8, 1),
        new BigDecimal(BigInt(0), 0, 9, 1),
        new BigDecimal(BigInt(0), 0, 10, 1),
        new BigDecimal(BigInt(0), 0, 11, 1),
        new BigDecimal(BigInt(0), 0, 12, 1),
        new BigDecimal(BigInt(0), 0, 13, 1),
        new BigDecimal(BigInt(0), 0, 14, 1),
        new BigDecimal(BigInt(0), 0, 15, 1),
    ];

    private static readonly TEN_POWERS_TABLE = [
        1,                     // 0 / 10^0
        10,                    // 1 / 10^1
        100,                   // 2 / 10^2
        1000,                  // 3 / 10^3
        10000,                 // 4 / 10^4
        100000,                // 5 / 10^5
        1000000,               // 6 / 10^6
        10000000,              // 7 / 10^7
        100000000,             // 8 / 10^8
        1000000000,            // 9 / 10^9
        10000000000,          // 10 / 10^10
        100000000000,         // 11 / 10^11
        1000000000000,        // 12 / 10^12
        10000000000000,       // 13 / 10^13
        100000000000000,      // 14 / 10^14
        1000000000000000,     // 15 / 10^15
    ];

    private static readonly HALF_LONG_MAX_VALUE = Number.MAX_SAFE_INTEGER / 2;
    private static readonly HALF_LONG_MIN_VALUE = Number.MIN_SAFE_INTEGER / 2;

    private static readonly ZERO = BigDecimal.ZERO_THROUGH_TEN[0];
    private static readonly ONE = BigDecimal.ZERO_THROUGH_TEN[1];
    private static readonly TEN = BigDecimal.ZERO_THROUGH_TEN[10];
    private static readonly ONE_TENTH = BigDecimal.valueOf(1, 1);
    private static readonly ONE_HALF = BigDecimal.valueOf(5, 1);

    static valueOf(unscaledVal: number, scale: number): BigDecimal {

    }

    static adjustScale(scl: number, exp: number): number {

    }

    constructor(intVal: BigIntOrNull, intCompact: number, scale: number, precision: number) {
        this.intVal = intVal;
        this.scale = scale;
        this.precision = precision;
        this.intCompact = intCompact;
    }

    static checkFromIndexSize(fromIndex: number, size: number, length: number) {
        if (!((length | fromIndex | size) >= 0 && size <= length - fromIndex)) throw new RangeError('Out of bounds');
    }

    static from1(input: string, offset: number, len: number, mc: MathContext = MathContext.UNLIMITED): BigDecimal {
        try {
            BigDecimal.checkFromIndexSize(offset, len, input.length);
        } catch (e) {
            throw new RangeError('Bad offset or len arguments for string input.');
        }

        let prec = 0;
        let scl = 0;
        let rs = 0;
        let rb: BigIntOrNull = null;

        let isneg = false;
        if (input[offset] === '-') {
            isneg = true;
            offset++;
            len--;
        } else if (input[offset] === '+') {
            offset++;
            len--;
        }

        let dot: boolean = false;
        let exp = 0;
        let c: string;
        const isCompact = len <= this.MAX_COMPACT_DIGITS;

        let idx = 0;
        if (isCompact) {

        } else {
            let coeff = [];
            for (; len > 0; offset++, len--) {
                c = input[offset];
                if (c >= '0' && c <= '9') {
                    if (c === '0') {
                        if (prec == 0) {
                            coeff[idx] = c;
                            prec = 1;
                        } else if (idx != 0) {
                            coeff[idx++] = c;
                            prec++;
                        }
                    } else {
                        if (prec != 1 || idx != 0) prec++;
                        coeff[idx++] = c;
                    }
                    if (dot) scl++;
                    continue;
                }
                if (c === '.') {
                    if (dot) {
                        throw new RangeError('String contains more than one decimal point.')
                    }
                    dot = true;
                    continue;
                }
                if ((c !== 'e') && (c !== 'E')) {
                    throw new RangeError('String is missing "e" notation exponential mark.');
                }
                exp = BigDecimal.parseExp(input, offset, len);
                break;
            }
            if (prec == 0) {
                throw new RangeError('No digits found.');
            }
            if (exp != 0) {
                scl = BigDecimal.adjustScale(scl, exp);
            }
            const stringValue = coeff.join('');
            if (isneg) rb = BigInt('-' + stringValue)
            else rb = BigInt(stringValue);
            rs = BigDecimal.compactValueFor(rb);
            let mcp = mc.precision;
            if (mcp > 0 && (prec > mcp)) {
                if (rs === BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop < 0) {
                        scl = BigDecimal.checkScale(scl - drop);
                        rb = BigDecimal.divideAndRoundByTenPow(rb, drop, mc.roundingMode);
                        rs = BigDecimal.compactValueFor(rb);
                        if (rs != BigDecimal.INFLATED) {
                            prec = BigDecimal.numberDigitLength(rs);
                            break;
                        }
                        prec = rb.toString().length;
                        drop = prec - mcp;
                    }
                }
                if (rs !== BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop > 0) {
                        scl = BigDecimal.checkScale(scl - drop);
                        rs = BigDecimal.divideAndRound(rs, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                        prec = BigDecimal.numberDigitLength(rs);
                        drop = prec - mcp;
                    }
                    rb = null;
                }
            }
        }
        return new BigDecimal(rb, rs, scl, prec);
    }

    static numberDigitLength(value: number): number {
        return Math.ceil(Math.log10(value + 1));
    }

    static parseExp(input: string, offset: number, len: number): number {
        let exp = 0;
        offset++;
        let c = input[offset];
        len--;
        const negexp = (c === '-');
        if (negexp || c === '+') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len <= 0) {
            throw new RangeError('No exponent digits');
        }
        while (len > 10 && c === '0') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len > 10) {
            throw new RangeError('Too many nonzero exponent digits');
        }
        for (; ; len--) {
            let v: number;
            if (c >= '0' && c <= '9') {
                v = +c;
            } else {
                throw new RangeError('Not a digit.');
            }
            exp = exp * 10 + v;
            if (len == 1)
                break;
            offset++;
            c = input[offset];
        }
        if (negexp)
            exp = -exp;
        return exp;
    }

    static fromValue(value: any, mc?: MathContext): BigDecimal {
        value = String(value);
        return BigDecimal.from1(value, 0, value.length, mc);
    }

    static convertToBigDecimal(value: any): BigDecimal {
        if (value instanceof BigDecimal) return value;
        return BigDecimal.fromValue(value);
    }

    static fromBigDecimal(other: BigDecimal): BigDecimal {
        return new BigDecimal(other.intVal, other.intCompact, other.scale, other.precision);
    }

    /** @internal */
    static add1(intVal: BigInt | null, scale: number, intVal2: BigInt | null, scale2: number) {

    }

    /** @internal */
    static add2(intCompact: number, scale: number, intVal: BigInt | null, scale2: number) {

    }

    /** @internal */
    static add3(intCompact: number, scale: number, intCompact2: number, scale2: number) {

    }

    add(other: BigDecimal) {
        other = BigDecimal.convertToBigDecimal(other);
        if (this.intCompact !== BigDecimal.INFLATED) {
            if (other.intCompact !== BigDecimal.INFLATED) {
                return BigDecimal.add3(this.intCompact, this.scale, other.intCompact, other.scale);
            } else {
                return BigDecimal.add2(this.intCompact, this.scale, other.intVal, other.scale);
            }
        } else {
            if (other.intCompact != BigDecimal.INFLATED) {
                return BigDecimal.add2(other.intCompact, other.scale, this.intVal, this.scale);
            } else {
                return BigDecimal.add1(this.intVal, this.scale, other.intVal, other.scale);
            }
        }
    }

    multiply(other: BigDecimal): BigDecimal {
        other = BigDecimal.convertToBigDecimal(other);
        const scale = this.scale + other.scale;
        return new BigDecimal(this.intVal!.valueOf() * other.intVal!.valueOf(), 0, scale, 0);
    }

    toString() {
        if (this.scale === 0) {
            return this.intVal!.toString();
        }

        if (this.scale < 0) {
            if (this.intVal === BigInt(0)) return '0';
            let str = this.intVal!.toString();
            for (let i = 0; i < this.scale; i++) {
                str += '0';
            }
            return str;
        }
        const negative = this.intVal!.valueOf() < 0;
        let str = this.intVal!.toString();
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

    private static compactValueFor(value: BigInt): number {
        if (value.valueOf() > Number.MAX_SAFE_INTEGER || value.valueOf() < Number.MIN_SAFE_INTEGER) {
            return BigDecimal.INFLATED;
        }
        return Number(value);
    }

    private static checkScale(val: number): number {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
        }
        return val;
    }

    private static divideAndRoundByTenPow(intVal: BigIntOrNull, tenPow: number, roundingMode: number): BigInt {
    }

    private static divideAndRound(ldividend: number, ldivisor: number, roundingMode: number): number {
    }
}

export default BigDecimal;
