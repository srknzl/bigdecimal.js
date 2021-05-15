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

    private static readonly ZERO_SCALED_BY = [
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
    private static NUMBER_10_POW = [
        1e0, 1e1, 1e2, 1e3, 1e4, 1e5,
        1e6, 1e7, 1e8, 1e9, 1e10, 1e11,
        1e12, 1e13, 1e14, 1e15
    ];


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
            rs = BigDecimal.compactValFor(rb);
            let mcp = mc.precision;
            if (mcp > 0 && (prec > mcp)) {
                if (rs === BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop < 0) {
                        scl = BigDecimal.checkScale(scl - drop);
                        rb = BigDecimal.divideAndRoundByTenPow(rb, drop, mc.roundingMode);
                        rs = BigDecimal.compactValFor(rb);
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

    static valueOf(unscaledVal: number, scale: number): BigDecimal {

    }

    static valueOf2(intVal: BigInt, scale: number, prec: number): BigDecimal {
        let val = BigDecimal.compactValFor(intVal);
        if (val === 0) {
            return BigDecimal.zeroValueOf(scale);
        } else if (scale === 0 && val >= 0 && val < BigDecimal.ZERO_THROUGH_TEN.length) {
            return BigDecimal.ZERO_THROUGH_TEN[val];
        }
        return new BigDecimal(intVal, val, scale, prec);
    }

    static valueOf3(unscaledVal: number, scale: number, prec: number): BigDecimal {

    }

    static valueOf4(unscaledVal: BigInt, scale: number): BigDecimal {

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
    static add1(fst: BigInt | null, scale1: number, snd: BigInt | null, scale2: number) {
        let rscale = scale1;
        let sdiff = rscale - scale2;
        if (sdiff != 0) {
            if (sdiff < 0) {
                let raise = BigDecimal.checkScale3(fst, -sdiff);
                rscale = scale2;
                fst = BigDecimal.bigMultiplyPowerTen2(fst, raise);
            } else {
                let raise = BigDecimal.checkScale3(snd, sdiff);
                snd = BigDecimal.bigMultiplyPowerTen2(snd, raise);
            }
        }
        let sum = fst!.valueOf() + snd!.valueOf();
        const sameSignum = ((fst! === 0n && snd! === 0n) || (fst! > 0n && snd! > 0n) || (fst! < 0n && snd! < 0n));
        return sameSignum ? new BigDecimal(sum, BigDecimal.INFLATED, rscale, 0) : BigDecimal.valueOf2(sum, rscale, 0);
    }

    /** @internal */
    static add2(xs: number, scale1: number, snd: BigInt | null, scale2: number) {
        let rscale = scale1;
        let sdiff = rscale - scale2;
        let sameSigns = ((snd! === 0n && xs === 0) || (snd! > 0n && xs > 0) || (snd! < 0n && xs < 0));
        let sum;
        if (sdiff < 0) {
            let raise = BigDecimal.checkScale2(xs, -sdiff);
            rscale = scale2;
            let scaledX = BigDecimal.longMultiplyPowerTen(xs, raise);
            if (scaledX == BigDecimal.INFLATED) {
                sum = snd!.valueOf() + BigDecimal.bigMultiplyPowerTen(xs, raise).valueOf();
            } else {
                sum = snd!.valueOf() + BigInt(scaledX).valueOf();
            }
        } else {
            let raise = BigDecimal.checkScale3(snd, sdiff);
            snd = BigDecimal.bigMultiplyPowerTen2(snd, raise);
            sum = snd!.valueOf() + BigInt(xs);
        }
        return (sameSigns) ?
            new BigDecimal(sum, BigDecimal.INFLATED, rscale, 0) : BigDecimal.valueOf2(sum, rscale, 0);
    }

    /** @internal */
    static add3(xs: number, scale1: number, ys: number, scale2: number) {
        const sdiff = scale1 - scale2;
        if (sdiff == 0) {
            return BigDecimal.add4(xs, ys, scale1);
        } else if (sdiff < 0) {
            let raise = BigDecimal.checkScale2(xs, -sdiff);
            let scaledX = BigDecimal.longMultiplyPowerTen(xs, raise);
            if (scaledX != BigDecimal.INFLATED) {
                return BigDecimal.add4(scaledX, ys, scale2);
            } else {
                let bigsum = BigDecimal.bigMultiplyPowerTen(xs, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ? // same sign test
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale2, 0) : BigDecimal.valueOf2(bigsum, scale2, 0);
            }
        } else {
            let raise = BigDecimal.checkScale2(ys, sdiff);
            let scaledY = BigDecimal.longMultiplyPowerTen(ys, raise);
            if (scaledY != BigDecimal.INFLATED) {
                return BigDecimal.add4(xs, scaledY, scale1);
            } else {
                let bigsum = BigDecimal.bigMultiplyPowerTen(ys, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ?
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale1, 0) : BigDecimal.valueOf2(bigsum, scale1, 0);
            }
        }
    }

    static add4(xs: number, ys: number, scale: number): BigDecimal {

    }

    static longMultiplyPowerTen(val: number, n: number): number {

    }


    signum(): number {
        const intCompactSignum = this.intCompact > 0 ? 1 : (this.intCompact < 0 ? -1 : 0);
        const intValSignum = BigDecimal.bigIntSignum(this.intVal!);
        return this.intCompact !== BigDecimal.INFLATED ? intCompactSignum : intValSignum;
    }

    setScale(scale: number): BigDecimal {

    }


    inflated(): BigInt {
        return this.intVal === null ? BigInt(this.intCompact) : this.intVal;
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

    private static compactValFor(value: BigInt): number {
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

    private static checkScale2(intCompact: number, val: number): number {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            val = (val > 0) ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            if (intCompact !== 0) {
                throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
            }
        }
        return val;
    }

    private static checkScale3(intVal: BigInt | null, val: number) {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            val = (val > 0) ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            if (intVal !== 0n) {
                throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
            }
        }
        return val;
    }

    private static divideAndRoundByTenPow(intVal: BigIntOrNull, tenPow: number, roundingMode: number): BigInt {
    }

    private static divideAndRound(ldividend: number, ldivisor: number, roundingMode: number): number {
    }

    private static bigMultiplyPowerTen(value: number, n: number): BigInt {
        if (n <= 0) return BigInt(value);
        return BigInt(10) ** BigInt(n) * BigInt(value);
    }

    private static bigMultiplyPowerTen2(value: BigInt | null, n: any): BigInt | null {
        if (n <= 0) return value;
        if (n < BigDecimal.TEN_POWERS_TABLE.length) {
            return value!.valueOf() * BigInt(BigDecimal.TEN_POWERS_TABLE[n]);
        }
        return BigInt(10) ** BigInt(n) * BigInt(value);
    }

    private static zeroValueOf(scale: number): BigDecimal {
        if (scale >= 0 && scale < BigDecimal.ZERO_SCALED_BY.length)
            return BigDecimal.ZERO_SCALED_BY[scale];
        else
            return new BigDecimal(BigInt(0), 0, scale, 1);
    }


    private static doRound(val: BigDecimal, mc: MathContext): BigDecimal {

    }

    private static doRound2(intVal: BigInt, scale: number, mc: MathContext): BigDecimal {

    }

    private static stripZerosToMatchScale(intVal: BigIntOrNull, intCompact: number, scale: number, preferredScale: number): BigDecimal {
        if (intCompact != BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(intCompact, scale, preferredScale);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(intVal === null ? BigDecimal.INFLATED_BIGINT : intVal.valueOf(),
                scale, preferredScale);
        }
    }

    private static createAndStripZerosToMatchScale(compactVal: number, scale: number, preferredScale: number): BigDecimal {
    }

    private static createAndStripZerosToMatchScale2(intVal: BigIntOrNull, scale: number, preferredScale: number): BigDecimal {
    }


    private static matchScale(val: BigDecimal[]): void {

    }

    private static preAlign(lhs: BigDecimal, augend: BigDecimal, padding: number, mc: MathContext): BigDecimal[] {
        if (padding != 0) {
            throw new RangeError('Padding must be zero');
        }
        let big: BigDecimal;
        let small: BigDecimal;

        if (padding < 0) {
            big = lhs;
            small = augend;
        } else {
            big = augend;
            small = lhs;
        }

        let estResultUlpScale = big.scale - big.precision + mc.precision;

        let smallHighDigitPos = small.scale - small.precision + 1;
        if (smallHighDigitPos > big.scale + 2 && // big and small disjoint
            smallHighDigitPos > estResultUlpScale + 2) { // small digits not visible
            small = BigDecimal.valueOf(small.signum(), this.checkScale(Math.max(big.scale, estResultUlpScale) + 3));
        }
        return [big, small];
    }


    negate(mc?: MathContext): BigDecimal {
        const result = this.intCompact == BigDecimal.INFLATED ?
            new BigDecimal(-1n * this.intVal!.valueOf(), BigDecimal.INFLATED, this.scale, this.precision) :
            BigDecimal.valueOf3(-this.intCompact, this.scale, this.precision);
        if (mc) {
            result.plus(mc);
        }
        return result;
    }

    add(augend: BigDecimal, mc?: MathContext): BigDecimal {
        augend = BigDecimal.convertToBigDecimal(augend);
        if (!mc || (mc && mc.precision === 0)) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                if (augend.intCompact !== BigDecimal.INFLATED) {
                    return BigDecimal.add3(this.intCompact, this.scale, augend.intCompact, augend.scale);
                } else {
                    return BigDecimal.add2(this.intCompact, this.scale, augend.intVal, augend.scale);
                }
            } else {
                if (augend.intCompact != BigDecimal.INFLATED) {
                    return BigDecimal.add2(augend.intCompact, augend.scale, this.intVal, this.scale);
                } else {
                    return BigDecimal.add1(this.intVal, this.scale, augend.intVal, augend.scale);
                }
            }
        }
        let lhsIsZero = this.signum() == 0;
        let augendIsZero = augend.signum() == 0;

        if (lhsIsZero || augendIsZero) {
            let preferredScale = Math.max(this.scale, augend.scale);
            let result: BigDecimal;

            if (lhsIsZero && augendIsZero)
                return BigDecimal.zeroValueOf(preferredScale);
            result = lhsIsZero ? BigDecimal.doRound(augend, mc) : BigDecimal.doRound(this, mc);

            if (result.scale === preferredScale)
                return result;
            else if (result.scale > preferredScale) {
                return BigDecimal.stripZerosToMatchScale(result.intVal, result.intCompact, result.scale, preferredScale);
            } else { // result.scale < preferredScale
                let precisionDiff = mc.precision - result.precision;
                let scaleDiff = preferredScale - result.scale;

                if (precisionDiff >= scaleDiff)
                    return result.setScale(preferredScale); // can achieve target scale
                else
                    return result.setScale(result.scale + precisionDiff);
            }
        }
        let padding = this.scale - augend.scale;
        if (padding != 0) { // scales differ; alignment needed
            let arg = BigDecimal.preAlign(this, augend, padding, mc);
            BigDecimal.matchScale(arg);
            Object.assign(this, arg[0]);
            augend = arg[1];
        }
        return BigDecimal.doRound2(this.inflated().valueOf() + augend.inflated().valueOf(), this.scale, mc);
    }

    subtract(subtrahend: BigDecimal, mc?: MathContext): BigDecimal {
        subtrahend = BigDecimal.convertToBigDecimal(subtrahend);
        if (!mc || (mc && mc.precision === 0)) {
            if (this.intCompact != BigDecimal.INFLATED) {
                if ((subtrahend.intCompact != BigDecimal.INFLATED)) {
                    return BigDecimal.add3(this.intCompact, this.scale, -subtrahend.intCompact, subtrahend.scale);
                } else {
                    return BigDecimal.add2(this.intCompact, this.scale, -1n * subtrahend.intVal!.valueOf(), subtrahend.scale);
                }
            } else {
                if ((subtrahend.intCompact != BigDecimal.INFLATED)) {
                    return BigDecimal.add2(-subtrahend.intCompact, subtrahend.scale, this.intVal, this.scale);
                } else {
                    return BigDecimal.add1(this.intVal, this.scale, -1n * subtrahend.intVal!.valueOf(), subtrahend.scale);
                }
            }
        }
        return this.add(subtrahend.negate(), mc);
    }

    multiply(multiplicand: BigDecimal, mc?: MathContext): BigDecimal {
        multiplicand = BigDecimal.convertToBigDecimal(multiplicand);
        if (!mc || (mc && mc.precision === 0)) {
            let productScale = BigDecimal.checkScale(this.scale + multiplicand.scale);
            if (this.intCompact != BigDecimal.INFLATED) {
                if ((multiplicand.intCompact != BigDecimal.INFLATED)) {
                    return BigDecimal.multiply2(this.intCompact, multiplicand.intCompact, productScale);
                } else {
                    return BigDecimal.multiply3(this.intCompact, multiplicand.intVal, productScale);
                }
            } else {
                if ((multiplicand.intCompact != BigDecimal.INFLATED)) {
                    return BigDecimal.multiply3(multiplicand.intCompact, this.intVal, productScale);
                } else {
                    return BigDecimal.multiply4(this.intVal, multiplicand.intVal, productScale);
                }
            }
        }
        let productScale = BigDecimal.checkScale(this.scale + multiplicand.scale);
        if (this.intCompact != BigDecimal.INFLATED) {
            if ((multiplicand.intCompact != BigDecimal.INFLATED)) {
                return BigDecimal.multiplyAndRound1(this.intCompact, multiplicand.intCompact, productScale, mc);
            } else {
                return BigDecimal.multiplyAndRound2(this.intCompact, multiplicand.intVal, productScale, mc);
            }
        } else {
            if ((multiplicand.intCompact != BigDecimal.INFLATED)) {
                return BigDecimal.multiplyAndRound2(multiplicand.intCompact, this.intVal, productScale, mc);
            } else {
                return BigDecimal.multiplyAndRound3(this.intVal, multiplicand.intVal, productScale, mc);
            }
        }
    }

    private divide(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (mc && mc.precision === 0) {
            if (divisor.signum() === 0) {
                if (this.signum() == 0)
                    throw new RangeError('Division undefined');
                throw new RangeError('Division by zero');
            }
            // Calculate preferred scale
            let preferredScale = BigDecimal.saturateScale(this.scale - divisor.scale);

            if (this.signum() == 0) // 0/y
                return BigDecimal.zeroValueOf(preferredScale);
            else {
                let mc = new MathContext(
                    Math.min(this.precision + Math.ceil(10.0 * divisor.precision / 3.0), Number.MAX_SAFE_INTEGER),
                    RoundingMode.UNNECESSARY
                );
                let quotient: BigDecimal;
                try {
                    quotient = this.divide(divisor, mc);
                } catch (e) {
                    throw new RangeError('Non-terminating decimal expansion; no exact representable decimal result.');
                }

                let quotientScale = quotient.scale;

                if (preferredScale > quotientScale)
                    return quotient.setScale2(preferredScale, RoundingMode.UNNECESSARY);
                return quotient;
            }
        }
        let dividend = this;
        let preferredScale = dividend.scale - divisor.scale;
        if (divisor.signum() == 0) {      // x/0
            if (dividend.signum() == 0)    // 0/0
                throw new RangeError('Division undefined');  // NaN
            throw new RangeError('Division by zero');
        }
        if (dividend.signum() == 0) // 0/y
            return BigDecimal.zeroValueOf(BigDecimal.saturateScale(preferredScale));
        let xscale = dividend.precision;
        let yscale = divisor.precision;
        if (dividend.intCompact !== BigDecimal.INFLATED) {
            if (divisor.intCompact !== BigDecimal.INFLATED) {
                return BigDecimal.divide2(dividend.intCompact, xscale, divisor.intCompact, yscale, preferredScale, mc);
            } else {
                return BigDecimal.divide3(dividend.intCompact, xscale, divisor.intVal, yscale, preferredScale, mc);
            }
        } else {
            if (divisor.intCompact !== BigDecimal.INFLATED) {
                return BigDecimal.divide4(dividend.intVal, xscale, divisor.intCompact, yscale, preferredScale, mc);
            } else {
                return BigDecimal.divide5(dividend.intVal, xscale, divisor.intVal, yscale, preferredScale, mc);
            }
        }
    }

    static multiply1(x: number, y: number): number {
    }

    static multiply2(x: number, y: number, scale: number): BigDecimal {
    }

    static multiply3(x: number, y: BigIntOrNull, scale: number): BigDecimal {
    }

    static multiply4(x: BigIntOrNull, y: BigIntOrNull, scale: number): BigDecimal {
    }

    private static multiplyAndRound1(x: number, y: number, scale: number, mc: MathContext): BigDecimal {
    }

    private static multiplyAndRound2(x: number, y: BigIntOrNull, scale: number, mc: MathContext): BigDecimal {
    }

    private static multiplyAndRound3(x: BigIntOrNull, y: BigIntOrNull, scale: number, mc: MathContext): BigDecimal {
    }

    private static saturateScale(s: number) {
        if (s > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (s < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return s;
    }

    private setScale2(newScale: number, roundingMode: RoundingMode): BigDecimal {

    }

    private static divide2(xs: number, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
    }

    private static divide3(xs: number, xscale: number, ys: BigIntOrNull, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
    }

    private static divide4(xs: BigIntOrNull, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
    }

    private static divide5(xs: BigIntOrNull, xscale: number, ys: BigIntOrNull, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
    }

    divideToIntegralValue(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (!mc || (mc && (mc.precision === 0 || this.compareMagnitude(divisor) < 0))) {
            let preferredScale = BigDecimal.saturateScale(this.scale - divisor.scale);
            if (this.compareMagnitude(divisor) < 0) {
                return BigDecimal.zeroValueOf(preferredScale);
            }

            if (this.signum() == 0 && divisor.signum() != 0)
                return this.setScale2(preferredScale, RoundingMode.UNNECESSARY);

            let maxDigits = Math.min(
                this.precision + Math.ceil(10.0 * divisor.precision / 3.0) + Math.abs(this.scale - divisor.scale) + 2,
                Number.MAX_SAFE_INTEGER
            );
            let quotient = this.divide(divisor, new MathContext(maxDigits, RoundingMode.DOWN));
            if (quotient.scale > 0) {
                quotient = quotient.setScale2(0, RoundingMode.DOWN);
                quotient = BigDecimal.stripZerosToMatchScale(quotient.intVal, quotient.intCompact, quotient.scale, preferredScale);
            }

            if (quotient.scale < preferredScale) {
                quotient = quotient.setScale2(preferredScale, RoundingMode.UNNECESSARY);
            }

            return quotient;
        }
        let preferredScale = BigDecimal.saturateScale(this.scale - divisor.scale);

        let result = this.divide(divisor, new MathContext(mc.precision, RoundingMode.DOWN));

        if (result.scale < 0) {
            let product = result.multiply(divisor);
            if (this.subtract(product).compareMagnitude(divisor) >= 0) {
                throw new RangeError('Division impossible');
            }
        } else if (result.scale > 0) {
            result = result.setScale2(0, RoundingMode.DOWN);
        }
        let precisionDiff;
        if ((preferredScale > result.scale) &&
            (precisionDiff = mc.precision - result.precision) > 0) {
            return result.setScale(result.scale + Math.min(precisionDiff, preferredScale - result.scale));
        } else {
            return BigDecimal.stripZerosToMatchScale(result.intVal, result.intCompact, result.scale, preferredScale);
        }
    }

    remainder(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        return this.divideAndRemainder(divisor, mc)[1];
    }

    compareMagnitude(val: BigDecimal): number {

    }

    divideAndRemainder(divisor: BigDecimal, mc?: MathContext): BigDecimal[] {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        let result = new Array<BigDecimal>(2);
        const lhs = this;

        result[0] = lhs.divideToIntegralValue(divisor, mc);
        result[1] = lhs.subtract(result[0].multiply(divisor));
        return result;

    }

    sqrt(mc: MathContext): BigDecimal {
        const signum = this.signum();
        if (signum !== 1) {
            let result = null;
            switch (signum) {
                case -1:
                    throw new RangeError('Attempted square root of negative BigDecimal');
                case 0:
                    result = BigDecimal.valueOf(0, this.scale / 2);
                    if (!this.squareRootResultAssertions(result, mc))
                        throw new RangeError('Square root result error');
                    return result;

                default:
                    throw new RangeError('Bad value from signum');
            }
        } else {

            let preferredScale = this.scale / 2;
            const zeroWithFinalPreferredScale = BigDecimal.valueOf(0, preferredScale);

            const stripped = this.stripTrailingZeros();
            let strippedScale = stripped.scale;

            if (stripped.isPowerOfTen() && strippedScale % 2 == 0) {
                let result = BigDecimal.valueOf(1, strippedScale / 2);
                if (result.scale != preferredScale) {
                    result = result.add(zeroWithFinalPreferredScale, mc);
                }
                return result;
            }

            let scaleAdjust = 0;
            let scale = stripped.scale - stripped.precision + 1;
            if (scale % 2 == 0) {
                scaleAdjust = scale;
            } else {
                scaleAdjust = scale - 1;
            }

            let working = stripped.scaleByPowerOfTen(scaleAdjust);

            if ((BigDecimal.ONE_TENTH.compareTo(working) <= 0 && working.compareTo(BigDecimal.TEN) < 0))
                throw new RangeError('Verifying 0.1 <= working < 10 failed')

            let guess = BigDecimal.fromValue(Math.sqrt(working.numberValue()));
            let guessPrecision = 15;
            let originalPrecision = mc.precision;
            let targetPrecision;

            if (originalPrecision == 0) {
                targetPrecision = stripped.precision / 2 + 1;
            } else {
                switch (mc.roundingMode) {
                    case RoundingMode.HALF_UP:
                    case RoundingMode.HALF_DOWN:
                    case RoundingMode.HALF_EVEN:
                        targetPrecision = 2 * originalPrecision;
                        if (targetPrecision < 0) // Overflow
                            targetPrecision = Number.MAX_SAFE_INTEGER - 2;
                        break;

                    default:
                        targetPrecision = originalPrecision;
                        break;
                }
            }

            let approx = guess;
            let workingPrecision = working.precision;
            do {
                let tmpPrecision = Math.max(Math.max(guessPrecision, targetPrecision + 2), workingPrecision);
                let mcTmp = new MathContext(tmpPrecision, RoundingMode.HALF_EVEN);
                // approx = 0.5 * (approx + fraction / approx)
                approx = BigDecimal.ONE_HALF.multiply(approx.add(working.divide(approx, mcTmp), mcTmp));
                guessPrecision *= 2;
            } while (guessPrecision < targetPrecision + 2);

            let result;
            let targetRm = mc.roundingMode;
            if (targetRm == RoundingMode.UNNECESSARY || originalPrecision == 0) {
                let tmpRm = (targetRm == RoundingMode.UNNECESSARY) ? RoundingMode.DOWN : targetRm;
                let mcTmp = new MathContext(targetPrecision, tmpRm);
                result = approx.scaleByPowerOfTen(-scaleAdjust / 2).round(mcTmp);

                // If result*result != this numerically, the square
                // root isn't exact
                if (this.subtract(result.square()).compareTo(BigDecimal.ZERO) != 0) {
                    throw new RangeError('Computed square root not exact.');
                }
            } else {
                result = approx.scaleByPowerOfTen(-scaleAdjust / 2).round(mc);

                switch (targetRm) {
                    case RoundingMode.DOWN:
                    case RoundingMode.FLOOR:
                        // Check if too big
                        if (result.square().compareTo(this) > 0) {
                            let ulp = result.ulp();
                            if (approx.compareTo(BigDecimal.ONE) == 0) {
                                ulp = ulp.multiply(BigDecimal.ONE_TENTH);
                            }
                            result = result.subtract(ulp);
                        }
                        break;

                    case RoundingMode.UP:
                    case RoundingMode.CEILING:
                        if (result.square().compareTo(this) < 0) {
                            result = result.add(result.ulp());
                        }
                        break;

                    default:
                        break;
                }

            }
            if (!this.squareRootResultAssertions(result, mc)) throw new RangeError('Square root result error');
            if (result.scale != preferredScale) {
                result = result.stripTrailingZeros().add(zeroWithFinalPreferredScale,
                    new MathContext(originalPrecision, RoundingMode.UNNECESSARY));
            }
            return result;
        }
    }

    squareRootResultAssertions(result: any, mc: MathContext): boolean {
        if (result.signum() == 0) {
            return this.squareRootZeroResultAssertions(result, mc);
        } else {
            let rm = mc.roundingMode;
            let ulp = result.ulp();
            let neighborUp = result.add(ulp);
            if (result.isPowerOfTen()) {
                ulp = ulp.divide(BigDecimal.TEN);
            }
            let neighborDown = result.subtract(ulp);

            if (!(result.signum() == 1 && this.signum() == 1))
                throw new RangeError('Bad signum of this and/or its sqrt.');

            switch (rm) {
                case RoundingMode.DOWN:
                case RoundingMode.FLOOR:
                    if (!(result.square().compareTo(this) <= 0 && neighborUp.square().compareTo(this) > 0))
                        throw new RangeError('Square of result out for bounds rounding' + RoundingMode[rm]);
                    return true;
                case RoundingMode.UP:
                case RoundingMode.CEILING:
                    if (!(result.square().compareTo(this) >= 0 && neighborDown.square().compareTo(this) < 0))
                        throw new RangeError('Square of result out for bounds rounding' + RoundingMode[rm]);
                    return true;
                case RoundingMode.HALF_DOWN:
                case RoundingMode.HALF_EVEN:
                case RoundingMode.HALF_UP:
                    let err = result.square().subtract(this).abs();
                    let errUp = neighborUp.square().subtract(this);
                    let errDown = this.subtract(neighborDown.square());
                    let err_comp_errUp = err.compareTo(errUp);
                    let err_comp_errDown = err.compareTo(errDown);

                    if (!(errUp.signum() == 1 && errDown.signum() == 1))
                        throw new RangeError('Errors of neighbors squared don\'t have correct signs');

                    if (!(err_comp_errUp <= 0 ||
                        err_comp_errDown <= 0))
                        throw new RangeError('Computed square root has larger error than neighbors for ' + RoundingMode[rm]);

                    if (!(((err_comp_errUp == 0) ? err_comp_errDown < 0 : true) && ((err_comp_errDown == 0) ? err_comp_errUp < 0 : true)))
                        throw new RangeError('Incorrect error relationships');
                    return true;

                default:
                    return true;
            }
        }
    }

    square(): BigDecimal {
        return this.multiply(this);
    }

    ulp(): BigDecimal {
        return BigDecimal.valueOf3(1, this.scale, 1);
    }

    static bigIntSignum(val: BigInt): number {
        return val! > 0n ? 1 : (val! < 0n ? -1 : 0);
    }

    stripTrailingZeros(): BigDecimal {
        if (this.intCompact === 0 || (this.intVal !== null && BigDecimal.bigIntSignum(this.intVal!) == 0)) {
            return BigDecimal.ZERO;
        } else if (this.intCompact != BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(this.intCompact, this.scale, Number.MIN_SAFE_INTEGER);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(this.intVal, this.scale, Number.MIN_SAFE_INTEGER);
        }
    }

    isPowerOfTen(): boolean {
        return this.unscaledValue() === 1n;
    }

    unscaledValue(): BigInt {
        return this.inflated();
    }

    scaleByPowerOfTen(n: number) {
        return new BigDecimal(this.intVal, this.intCompact, BigDecimal.checkScale(this.scale - n), this.precision);
    }

    compareTo(val: BigDecimal): number {
        val = BigDecimal.convertToBigDecimal(val);
        if (this.scale == val.scale) {
            let xs = this.intCompact;
            let ys = val.intCompact;
            if (xs != BigDecimal.INFLATED && ys != BigDecimal.INFLATED) {
                return xs != ys ? (xs > ys ? 1 : -1) : 0;
            }
        }

        let xsign = this.signum();
        let ysign = val.signum();
        if (xsign != ysign) {
            return xsign > ysign ? 1 : -1;
        } else if (xsign == 0) {
            return 0;
        } else {
            let cmp = this.compareMagnitude(val);
            return xsign > 0 ? cmp : -cmp;
        }
    }

    numberValue(): number {
        if (this.intCompact != BigDecimal.INFLATED) {
            if (this.scale == 0) {
                return this.intCompact;
            } else {
                if (Math.abs(this.intCompact) < Number.MAX_SAFE_INTEGER) {
                    if (this.scale > 0 && this.scale <= BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact / BigDecimal.NUMBER_10_POW[this.scale];
                    } else if (this.scale < 0 && this.scale >= -BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact * BigDecimal.NUMBER_10_POW[-this.scale];
                    }
                }
            }
        }
        return Number(this.toString());
    }

    round(mc: MathContext): BigDecimal {
        return this.plus(mc);
    }

    setScale(newScale: number, roundingMode?: RoundingMode): BigDecimal {
        /*
        if (roundingMode < ROUND_UP || roundingMode > ROUND_UNNECESSARY)
            throw new IllegalArgumentException("Invalid rounding mode");

        int oldScale = this.scale;
        if (newScale == oldScale)        // easy case
            return this;
        if (this.signum() == 0)            // zero can have any scale
            return zeroValueOf(newScale);
        if(this.intCompact!=INFLATED) {
            long rs = this.intCompact;
            if (newScale > oldScale) {
                int raise = checkScale((long) newScale - oldScale);
                if ((rs = longMultiplyPowerTen(rs, raise)) != INFLATED) {
                    return valueOf(rs,newScale);
                }
                BigInteger rb = bigMultiplyPowerTen(raise);
                return new BigDecimal(rb, INFLATED, newScale, (precision > 0) ? precision + raise : 0);
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                int drop = checkScale((long) oldScale - newScale);
                if (drop < LONG_TEN_POWERS_TABLE.length) {
                    return divideAndRound(rs, LONG_TEN_POWERS_TABLE[drop], newScale, roundingMode, newScale);
                } else {
                    return divideAndRound(this.inflated(), bigTenToThe(drop), newScale, roundingMode, newScale);
                }
            }
        } else {
            if (newScale > oldScale) {
                int raise = checkScale((long) newScale - oldScale);
                BigInteger rb = bigMultiplyPowerTen(this.intVal,raise);
                return new BigDecimal(rb, INFLATED, newScale, (precision > 0) ? precision + raise : 0);
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                int drop = checkScale((long) oldScale - newScale);
                if (drop < LONG_TEN_POWERS_TABLE.length)
                    return divideAndRound(this.intVal, LONG_TEN_POWERS_TABLE[drop], newScale, roundingMode,
                                          newScale);
                else
                    return divideAndRound(this.intVal,  bigTenToThe(drop), newScale, roundingMode, newScale);
            }
        }
         */
    }

    plus(mc?: MathContext): BigDecimal {
        if (!mc) return this;
        if (mc.precision == 0)
            return this;
        return BigDecimal.doRound(this, mc);
    }

    squareRootZeroResultAssertions(result: any, mc: MathContext) {
        return this.compareTo(BigDecimal.ZERO) === 0;
    }

    pow(n: number, mc?: MathContext): BigDecimal {
        if (!mc || (mc && mc.precision == 0)) {
            if (n < 0 || n > 999999999)
                throw new RangeError('Invalid operation');
            let newScale = BigDecimal.checkScale(this.scale * n);
            return BigDecimal.valueOf4(this.inflated().valueOf() ** BigInt(n), newScale);
        }
        if (n < -999999999 || n > 999999999)
            throw new RangeError('Invalid operation');
        if (n == 0)
            return BigDecimal.ONE;
        let lhs = this;
        let workmc = mc;
        let mag = Math.abs(n);
        if (mc.precision > 0) {
            let elength = BigDecimal.numberDigitLength(mag);
            if (elength > mc.precision)
                throw new RangeError('Invalid operation');
            workmc = new MathContext(mc.precision + elength + 1, mc.roundingMode);
        }
        let acc = BigDecimal.ONE;
        let seenbit = false;
        for (let i = 1; ; i++) {
            mag += mag;
            if (mag < 0) {
                seenbit = true;
                acc = acc.multiply(lhs, workmc);
            }
            if (i == 31)
                break;
            if (seenbit)
                acc = acc.multiply(acc, workmc);
        }
        if (n < 0) // [hence mc.precision>0]
            acc = BigDecimal.ONE.divide(acc, workmc);
        return BigDecimal.doRound(acc, mc);
    }

    abs(mc?: MathContext) {
        return this.signum() < 0 ? this.negate(mc) : this.plus(mc);
    }
}

export default BigDecimal;
