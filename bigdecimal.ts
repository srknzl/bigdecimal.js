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

    readonly intVal: BigIntOrNull;

    readonly scale: number;

    precision: number;

    stringCache: string | undefined = undefined;

    static readonly INFLATED = Number.MIN_SAFE_INTEGER;
    static readonly INFLATED_BIGINT = BigInt(BigDecimal.INFLATED);

    readonly intCompact: number;
    // All 15-digit base ten strings fit into a safe number; not all 16-digit
    // strings will
    static readonly MAX_COMPACT_DIGITS = 15;

    static readonly ZERO_THROUGH_TEN = [
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

    static readonly ZERO_SCALED_BY = [
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

    static readonly TEN_POWERS_TABLE = [
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

    static readonly HALF_NUMBER_MAX_VALUE = Number.MAX_SAFE_INTEGER / 2;
    static readonly HALF_NUMBER_MIN_VALUE = Number.MIN_SAFE_INTEGER / 2;

    static readonly ZERO = BigDecimal.ZERO_THROUGH_TEN[0];
    static readonly ONE = BigDecimal.ZERO_THROUGH_TEN[1];
    static readonly TEN = BigDecimal.ZERO_THROUGH_TEN[10];
    static readonly ONE_TENTH = BigDecimal.valueOf(1, 1);
    static readonly ONE_HALF = BigDecimal.valueOf(5, 1);
    static NUMBER_10_POW = [
        1e0, 1e1, 1e2, 1e3, 1e4, 1e5,
        1e6, 1e7, 1e8, 1e9, 1e10, 1e11,
        1e12, 1e13, 1e14, 1e15
    ];

    private static THRESHOLDS_TABLE = [
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER / 10,
        Number.MAX_SAFE_INTEGER / 100,
        Number.MAX_SAFE_INTEGER / 1000,
        Number.MAX_SAFE_INTEGER / 10000,
        Number.MAX_SAFE_INTEGER / 100000,
        Number.MAX_SAFE_INTEGER / 1000000,
        Number.MAX_SAFE_INTEGER / 10000000,
        Number.MAX_SAFE_INTEGER / 100000000,
        Number.MAX_SAFE_INTEGER / 1000000000,
        Number.MAX_SAFE_INTEGER / 10000000000,
        Number.MAX_SAFE_INTEGER / 100000000000,
        Number.MAX_SAFE_INTEGER / 1000000000000,
        Number.MAX_SAFE_INTEGER / 10000000000000,
        Number.MAX_SAFE_INTEGER / 100000000000000,
        Number.MAX_SAFE_INTEGER / 1000000000000000,
    ];


    static adjustScale(scl: number, exp: number): number {
        return 0;
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
        return new BigDecimal(0n, 0, 0, 0);
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
        return new BigDecimal(0n, 0, 0, 0);
    }

    static valueOf4(unscaledVal: BigInt, scale: number): BigDecimal {
        return new BigDecimal(0n, 0, 0, 0);
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
                fst = BigDecimal.bigMultiplyPowerTen3(fst, raise);
            } else {
                let raise = BigDecimal.checkScale3(snd, sdiff);
                snd = BigDecimal.bigMultiplyPowerTen3(snd, raise);
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
            let scaledX = BigDecimal.numberMultiplyPowerTen(xs, raise);
            if (scaledX == BigDecimal.INFLATED) {
                sum = snd!.valueOf() + BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf();
            } else {
                sum = snd!.valueOf() + BigInt(scaledX).valueOf();
            }
        } else {
            let raise = BigDecimal.checkScale3(snd, sdiff);
            snd = BigDecimal.bigMultiplyPowerTen3(snd, raise);
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
            let scaledX = BigDecimal.numberMultiplyPowerTen(xs, raise);
            if (scaledX != BigDecimal.INFLATED) {
                return BigDecimal.add4(scaledX, ys, scale2);
            } else {
                let bigsum = BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ? // same sign test
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale2, 0) : BigDecimal.valueOf2(bigsum, scale2, 0);
            }
        } else {
            let raise = BigDecimal.checkScale2(ys, sdiff);
            let scaledY = BigDecimal.numberMultiplyPowerTen(ys, raise);
            if (scaledY != BigDecimal.INFLATED) {
                return BigDecimal.add4(xs, scaledY, scale1);
            } else {
                let bigsum = BigDecimal.bigMultiplyPowerTen2(ys, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ?
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale1, 0) : BigDecimal.valueOf2(bigsum, scale1, 0);
            }
        }
    }

    static add4(xs: number, ys: number, scale: number): BigDecimal {
        return new BigDecimal(0n, 0, 0, 0);
    }

    static numberMultiplyPowerTen(val: number, n: number): number {
        if (val == 0 || n <= 0)
            return val;
        let tab = BigDecimal.TEN_POWERS_TABLE;
        let bounds = BigDecimal.THRESHOLDS_TABLE;
        if (n < tab.length && n < bounds.length) {
            let tenpower = tab[n];
            if (val == 1)
                return tenpower;
            if (Math.abs(val) <= bounds[n])
                return val * tenpower;
        }
        return BigDecimal.INFLATED;
    }


    signum(): number {
        const intCompactSignum = this.intCompact > 0 ? 1 : (this.intCompact < 0 ? -1 : 0);
        const intValSignum = BigDecimal.bigIntSignum(this.intVal!);
        return this.intCompact !== BigDecimal.INFLATED ? intCompactSignum : intValSignum;
    }


    inflated(): BigInt {
        return this.intVal === null ? BigInt(this.intCompact) : this.intVal;
    }

    static compactValFor(value: BigInt): number {
        if (value.valueOf() > Number.MAX_SAFE_INTEGER || value.valueOf() < Number.MIN_SAFE_INTEGER) {
            return BigDecimal.INFLATED;
        }
        return Number(value);
    }

    static checkScale(val: number): number {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
        }
        return val;
    }

    static checkScale2(intCompact: number, val: number): number {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            val = (val > 0) ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            if (intCompact !== 0) {
                throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
            }
        }
        return val;
    }

    static checkScale3(intVal: BigInt | null, val: number) {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            val = (val > 0) ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
            if (intVal !== 0n) {
                throw new Error(val > 0 ? 'Scale too high' : 'Scale too less')
            }
        }
        return val;
    }

    static divideAndRoundByTenPow(intVal: BigIntOrNull, tenPow: number, roundingMode: number): BigInt {
        if (tenPow < BigDecimal.TEN_POWERS_TABLE.length)
            intVal = BigDecimal.divideAndRound5(intVal, BigDecimal.TEN_POWERS_TABLE[tenPow], roundingMode);
        else
            intVal = BigDecimal.divideAndRound6(intVal, BigInt(10) ** BigInt(tenPow), roundingMode);
        return intVal;
    }

    static divideAndRound(ldividend: number, ldivisor: number, roundingMode: number): number {
        return 0;
    }

    bigMultiplyPowerTen(n: number): BigInt {
        if (n <= 0)
            return this.inflated();
        if (this.intCompact != BigDecimal.INFLATED)
            return BigInt(10) ** BigInt(n) * BigInt(this.intCompact);
        else
            return this.intVal!.valueOf() * BigInt(10) ** BigInt(n);
    }

    static bigMultiplyPowerTen2(value: number, n: number): BigInt {
        if (n <= 0) return BigInt(value);
        return BigInt(10) ** BigInt(n) * BigInt(value);
    }

    static bigMultiplyPowerTen3(value: BigInt | null, n: any): BigInt | null {
        if (n <= 0) return value;
        if (n < BigDecimal.TEN_POWERS_TABLE.length) {
            return value!.valueOf() * BigInt(BigDecimal.TEN_POWERS_TABLE[n]);
        }
        return BigInt(10) ** BigInt(n) * BigInt(value);
    }

    static zeroValueOf(scale: number): BigDecimal {
        if (scale >= 0 && scale < BigDecimal.ZERO_SCALED_BY.length)
            return BigDecimal.ZERO_SCALED_BY[scale];
        else
            return new BigDecimal(BigInt(0), 0, scale, 1);
    }


    static doRound(val: BigDecimal, mc: MathContext): BigDecimal {
        let mcp = mc.precision;
        let wasDivided = false;
        if (mcp > 0) {
            let intVal = val.intVal;
            let compactVal = val.intCompact;
            let scale = val.scale;
            let prec = val.precision;
            let mode = mc.roundingMode;
            let drop;
            if (compactVal == BigDecimal.INFLATED) {
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScale(scale - drop);
                    intVal = BigDecimal.divideAndRoundByTenPow(intVal, drop, mode);
                    wasDivided = true;
                    compactVal = BigDecimal.compactValFor(intVal);
                    if (compactVal != BigDecimal.INFLATED) {
                        prec = BigDecimal.numberDigitLength(compactVal);
                        break;
                    }
                    prec = intVal!.toString().length;
                    drop = prec - mcp;
                }
            }
            if (compactVal != BigDecimal.INFLATED) {
                drop = prec - mcp;  // drop can't be more than 18
                while (drop > 0) {
                    scale = BigDecimal.checkScale(
                        scale - drop
                    )
                    ;
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    wasDivided = true;
                    prec = BigDecimal.numberDigitLength(compactVal);
                    drop = prec - mcp;
                    intVal = null;
                }
            }
            return wasDivided ? new BigDecimal(intVal, compactVal, scale, prec) : val;
        }
        return val;
    }

    static doRound2(intVal: BigInt, scale: number, mc: MathContext): BigDecimal {
        let mcp = mc.precision;
        let prec = 0;
        if (mcp > 0) {
            let compactVal = BigDecimal.compactValFor(intVal);
            let mode = mc.roundingMode;
            let drop;
            if (compactVal == BigDecimal.INFLATED) {
                prec = intVal.toString().length;
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScale(scale - drop);
                    intVal = BigDecimal.divideAndRoundByTenPow(intVal, drop, mode);
                    compactVal = BigDecimal.compactValFor(intVal);
                    if (compactVal != BigDecimal.INFLATED) {
                        break;
                    }
                    prec = intVal.toString().length;
                    drop = prec - mcp;
                }
            }
            if (compactVal != BigDecimal.INFLATED) {
                prec = BigDecimal.numberDigitLength(compactVal);
                drop = prec - mcp;     // drop can't be more than 18
                while (drop > 0) {
                    scale = BigDecimal.checkScale(
                        scale - drop
                    )
                    ;
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.numberDigitLength(compactVal);
                    drop = prec - mcp;
                }
                return BigDecimal.valueOf(compactVal, scale, prec);
            }
        }
        return new BigDecimal(intVal, BigDecimal.INFLATED, scale, prec);
    }

    static doRound3(compactVal: number, scale: number, mc: MathContext): BigDecimal {
        let mcp = mc.precision;
        if (mcp > 0 && mcp < 19) {
            let prec = BigDecimal.numberDigitLength(compactVal);
            let drop = prec - mcp;  // drop can't be more than 18
            while (drop > 0) {
                scale = BigDecimal.checkScale(
                    scale - drop
                )
                ;
                compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                prec = BigDecimal.numberDigitLength(compactVal);
                drop = prec - mcp;
            }
            return BigDecimal.valueOf(compactVal, scale, prec);
        }
        return BigDecimal.valueOf(compactVal, scale);
    }

    static stripZerosToMatchScale(intVal: BigIntOrNull, intCompact: number, scale: number, preferredScale: number): BigDecimal {
        if (intCompact != BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(intCompact, scale, preferredScale);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(intVal === null ? BigDecimal.INFLATED_BIGINT : intVal.valueOf(),
                scale, preferredScale);
        }
    }

    static createAndStripZerosToMatchScale(compactVal: number, scale: number, preferredScale: number): BigDecimal {
        while (Math.abs(compactVal) >= 10 && scale > preferredScale) {
            if ((compactVal & 1) != 0)
                break; // odd number cannot end in 0
            let r = compactVal % 10;
            if (r != 0)
                break; // non-0 remainder
            compactVal /= 10;
            scale = BigDecimal.checkScale(compactVal, scale - 1); // could Overflow
        }
        return BigDecimal.valueOf(compactVal, scale);
    }

    static createAndStripZerosToMatchScale2(intVal: BigIntOrNull, scale: number, preferredScale: number): BigDecimal {
        let qr[]; // quotient-remainder pair
        while (intVal.compareMagnitude(BigInteger.TEN) >= 0
        && scale > preferredScale) {
            if (intVal.testBit(0))
                break; // odd number cannot end in 0
            qr = intVal.divideAndRemainder(BigInteger.TEN);
            if (qr[1].signum() != 0)
                break; // non-0 remainder
            intVal = qr[0];
            scale = BigDecimal.checkScale(intVal, scale - 1); // could Overflow
        }
        return BigDecimal.valueOf(intVal, scale, 0);
    }


    static matchScale(val: BigDecimal[]): void {
        if (val[0].scale < val[1].scale) {
            val[0] = val[0].setScale(val[1].scale, RoundingMode.UNNECESSARY);
        } else if (val[1].scale < val[0].scale) {
            val[1] = val[1].setScale(val[0].scale, RoundingMode.UNNECESSARY);
        }
    }

    preAlign(augend: BigDecimal, padding: number, mc: MathContext): BigDecimal[] {
        if (padding != 0) {
            throw new RangeError('Padding must be zero');
        }
        let big: BigDecimal;
        let small: BigDecimal;

        if (padding < 0) {
            big = this;
            small = augend;
        } else {
            big = augend;
            small = this;
        }

        let estResultUlpScale = big.scale - big.precision + mc.precision;

        let smallHighDigitPos = small.scale - small.precision + 1;
        if (smallHighDigitPos > big.scale + 2 && // big and small disjoint
            smallHighDigitPos > estResultUlpScale + 2) { // small digits not visible
            small = BigDecimal.valueOf(small.signum(), BigDecimal.checkScale(Math.max(big.scale, estResultUlpScale) + 3));
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
            let arg = this.preAlign(augend, padding, mc);
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

    divide(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (!mc || (mc && mc.precision === 0)) {
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
        long
        product = x * y;
        long
        ax = Math.abs(x);
        long
        ay = Math.abs(y);
        if (((ax | ay) >>> 31 == 0) || (y == 0) || (product / y == x)) {
            return product;
        }
        return BigDecimal.INFLATED;
    }

    static multiply2(x: number, y: number, scale: number): BigDecimal {
        long
        product = multiply(x, y);
        if (product != BigDecimal.INFLATED) {
            return valueOf(product, scale);
        }
        return new BigDecimal(BigInteger.valueOf(x).multiply(y), BigDecimal.INFLATED, scale, 0);
    }

    static multiply3(x: number, y: BigIntOrNull, scale: number): BigDecimal {
        if (x == 0) {
            return zeroValueOf(scale);
        }
        return new BigDecimal(y.multiply(x), BigDecimal.INFLATED, scale, 0);
    }

    static multiply4(x: BigIntOrNull, y: BigIntOrNull, scale: number): BigDecimal {
        return new BigDecimal(x!.valueOf() * y!.valueOf(), BigDecimal.INFLATED, scale, 0);
    }

    static multiplyAndRound1(x: number, y: number, scale: number, mc: MathContext): BigDecimal {
        long
        product = multiply(x, y);
        if (product != BigDecimal.INFLATED) {
            return doRound(product, scale, mc);
        }
        // attempt to do it in 128 bits
        int
        rsign = 1;
        if (x < 0) {
            x = -x;
            rsign = -1;
        }
        if (y < 0) {
            y = -y;
            rsign *= -1;
        }
        // multiply dividend0 * dividend1
        long
        m0_hi = x >>> 32;
        long
        m0_lo = x & LONG_MASK;
        long
        m1_hi = y >>> 32;
        long
        m1_lo = y & LONG_MASK;
        product = m0_lo * m1_lo;
        long
        m0 = product & LONG_MASK;
        long
        m1 = product >>> 32;
        product = m0_hi * m1_lo + m1;
        m1 = product & LONG_MASK;
        long
        m2 = product >>> 32;
        product = m0_lo * m1_hi + m1;
        m1 = product & LONG_MASK;
        m2 += product >>> 32;
        long
        m3 = m2 >>> 32;
        m2 &= LONG_MASK;
        product = m0_hi * m1_hi + m2;
        m2 = product & LONG_MASK;
        m3 = ((product >>> 32) + m3) & LONG_MASK;
        final
        long
        mHi = make64(m3, m2);
        final
        long
        mLo = make64(m1, m0);
        BigDecimal
        res = doRound128(mHi, mLo, rsign, scale, mc);
        if (res != null) {
            return res;
        }
        res = new BigDecimal(BigInteger.valueOf(x).multiply(y * rsign), BigDecimal.INFLATED, scale, 0);
        return doRound(res, mc);
    }


    static multiplyAndRound2(x: number, y: BigIntOrNull, scale: number, mc: MathContext): BigDecimal {
        if (x == 0) {
            return zeroValueOf(scale);
        }
        return doRound(y.multiply(x), scale, mc);
    }

    static multiplyAndRound3(x: BigIntOrNull, y: BigIntOrNull, scale: number, mc: MathContext): BigDecimal {
        return doRound(x.multiply(y), scale, mc);
    }

    static saturateScale(s: number) {
        if (s > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (s < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return s;
    }

    setScale2(newScale: number, roundingMode: RoundingMode): BigDecimal {
        return new BigDecimal(0n, 0, 0, 0);

    }

    static divide2(xs: number, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
        int
        mcp = mc.precision;
        if (xscale <= yscale && yscale < 18 && mcp < 18) {
            return BigDecimal.divideSmallFastPath(xs, xscale, ys, yscale, preferredScale, mc);
        }
        if (compareMagnitudeNormalized(xs, xscale, ys, yscale) > 0) {// satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        int
        roundingMode = mc.roundingMode;
        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        int
        scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
        BigDecimal
        quotient;
        if (BigDecimal.checkScale(mcp + yscale - xscale
            ) >
            0
        ) {
            int
            raise = BigDecimal.checkScale(
                mcp + yscale - xscale
            )
            ;
            long
            scaledXs;
            if ((scaledXs = longMultiplyPowerTen(xs, raise)) == BigDecimal.INFLATED) {
                BigInteger
                rb = bigMultiplyPowerTen(xs, raise);
                quotient = divideAndRound(rb, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
            } else {
                quotient = divideAndRound(scaledXs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
            }
        } else {
            int
            newScale = BigDecimal.checkScale(
                xscale - mcp
            )
            ;
            // assert newScale >= yscale
            if (newScale == yscale) { // easy case
                quotient = divideAndRound(xs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
            } else {
                int
                raise = BigDecimal.checkScale(
                    newScale - yscale
                )
                ;
                long
                scaledYs;
                if ((scaledYs = longMultiplyPowerTen(ys, raise)) == BigDecimal.INFLATED) {
                    BigInteger
                    rb = bigMultiplyPowerTen(ys, raise);
                    quotient = divideAndRound(BigInteger.valueOf(xs),
                        rb, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                } else {
                    quotient = divideAndRound(xs, scaledYs, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                }
            }
        }
        // doRound, here, only affects 1000000000 case.
        return doRound(quotient, mc);
    }

    static divide3(xs: number, xscale: number, ys: BigIntOrNull, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if (compareMagnitudeNormalized(xs, xscale, ys, yscale) > 0) {// satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        int
        mcp = mc.precision;
        int
        roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        BigDecimal
        quotient;
        int
        scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScale(mcp + yscale - xscale
            ) >
            0
        ) {
            int
            raise = BigDecimal.checkScale(
                mcp + yscale - xscale
            )
            ;
            BigInteger
            rb = bigMultiplyPowerTen(xs, raise);
            quotient = divideAndRound(rb, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
        } else {
            int
            newScale = BigDecimal.checkScale(
                xscale - mcp
            )
            ;
            int
            raise = BigDecimal.checkScale(
                newScale - yscale
            )
            ;
            BigInteger
            rb = bigMultiplyPowerTen(ys, raise);
            quotient = divideAndRound(BigInteger.valueOf(xs), rb, scl, roundingMode, BigDecimal.checkScale(preferredScale));
        }
        // doRound, here, only affects 1000000000 case.
        return doRound(quotient, mc);
    }

    static divide4(xs: BigIntOrNull, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if ((-compareMagnitudeNormalized(ys, yscale, xs, xscale)) > 0) {// satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        int
        mcp = mc.precision;
        int
        roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        BigDecimal
        quotient;
        int
        scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScale(mcp + yscale - xscale
            ) >
            0
        ) {
            int
            raise = BigDecimal.checkScale(
                mcp + yscale - xscale
            )
            ;
            BigInteger
            rb = bigMultiplyPowerTen(xs, raise);
            quotient = divideAndRound(rb, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
        } else {
            int
            newScale = BigDecimal.checkScale(
                xscale - mcp
            )
            ;
            // assert newScale >= yscale
            if (newScale == yscale) { // easy case
                quotient = divideAndRound(xs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
            } else {
                int
                raise = BigDecimal.checkScale(
                    newScale - yscale
                )
                ;
                long
                scaledYs;
                if ((scaledYs = longMultiplyPowerTen(ys, raise)) == BigDecimal.INFLATED) {
                    BigInteger
                    rb = bigMultiplyPowerTen(ys, raise);
                    quotient = divideAndRound(xs, rb, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                } else {
                    quotient = divideAndRound(xs, scaledYs, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                }
            }
        }
        // doRound, here, only affects 1000000000 case.
        return doRound(quotient, mc);
    }

    static divide5(xs: BigIntOrNull, xscale: number, ys: BigIntOrNull, yscale: number, preferredScale: number, mc: MathContext): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if (compareMagnitudeNormalized(xs, xscale, ys, yscale) > 0) {// satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        int
        mcp = mc.precision;
        int
        roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        BigDecimal
        quotient;
        int
        scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScale(mcp + yscale - xscale
            ) >
            0
        ) {
            int
            raise = BigDecimal.checkScale(
                mcp + yscale - xscale
            )
            ;
            BigInteger
            rb = bigMultiplyPowerTen(xs, raise);
            quotient = divideAndRound(rb, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
        } else {
            int
            newScale = BigDecimal.checkScale(
                xscale - mcp
            )
            ;
            int
            raise = BigDecimal.checkScale(
                newScale - yscale
            )
            ;
            BigInteger
            rb = bigMultiplyPowerTen(ys, raise);
            quotient = divideAndRound(xs, rb, scl, roundingMode, BigDecimal.checkScale(preferredScale));
        }
        // doRound, here, only affects 1000000000 case.
        return doRound(quotient, mc);
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
        // Match scales, avoid unnecessary inflation
        let ys = val.intCompact;
        let xs = this.intCompact;
        if (xs == 0)
            return (ys == 0) ? 0 : -1;
        if (ys == 0)
            return 1;

        let sdiff = this.scale - val.scale;
        if (sdiff != 0) {
            // Avoid matching scales if the (adjusted) exponents differ
            let xae = this.precision - this.scale;   // [-1]
            let yae = val.precision - val.scale;     // [-1]
            if (xae < yae)
                return -1;
            if (xae > yae)
                return 1;
            if (sdiff < 0) {
                // The cases sdiff <= Integer.MIN_VALUE intentionally fall through.
                if (sdiff > Number.MIN_SAFE_INTEGER &&
                    (xs == BigDecimal.INFLATED ||
                        (xs = BigDecimal.numberMultiplyPowerTen(xs, -sdiff)) == BigDecimal.INFLATED) &&
                    ys == BigDecimal.INFLATED) {
                    let rb = this.bigMultiplyPowerTen(-sdiff);
                    return BigDecimal.bigIntCompareMagnitude(rb, this.intVal!);
                }
            } else { // sdiff > 0
                if (sdiff <= Number.MAX_SAFE_INTEGER &&
                    (ys == BigDecimal.INFLATED ||
                        (ys = BigDecimal.numberMultiplyPowerTen(ys, sdiff)) == BigDecimal.INFLATED) &&
                    xs == BigDecimal.INFLATED) {
                    let rb = val.bigMultiplyPowerTen(sdiff);
                    return BigDecimal.bigIntCompareMagnitude(this.intVal!, rb);
                }
            }
        }
        if (xs != BigDecimal.INFLATED)
            return (ys != BigDecimal.INFLATED) ? BigDecimal.numberCompareMagnitude(xs, ys) : -1;
        else if (ys != BigDecimal.INFLATED)
            return 1;
        else
            return BigDecimal.bigIntCompareMagnitude(this.intVal!, val.intVal!);
    }

    equals(x: any): boolean {
        if (!(x instanceof BigDecimal))
            return false;
        if (x == this)
            return true;
        if (this.scale != x.scale)
            return false;
        let s = this.intCompact;
        let xs = x.intCompact;
        if (s != BigDecimal.INFLATED) {
            if (xs == BigDecimal.INFLATED)
                xs = BigDecimal.compactValFor(x.intVal!);
            return xs == s;
        } else if (xs != BigDecimal.INFLATED)
            return xs == BigDecimal.compactValFor(this.intVal!);

        return this.inflated() === x.inflated();
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

    setScale(newScale: number, roundingMode: RoundingMode = RoundingMode.UNNECESSARY): BigDecimal {
        if (roundingMode < RoundingMode.UP || roundingMode > RoundingMode.UNNECESSARY)
            throw new RangeError('Invalid rounding mode');

        let oldScale = this.scale;
        if (newScale == oldScale)        // easy case
            return this;
        if (this.signum() == 0)            // zero can have any scale
            return BigDecimal.zeroValueOf(newScale);
        if (this.intCompact != BigDecimal.INFLATED) {
            let rs = this.intCompact;
            if (newScale > oldScale) {
                let raise = BigDecimal.checkScale(newScale - oldScale);
                if ((rs = BigDecimal.numberMultiplyPowerTen(rs, raise)) != BigDecimal.INFLATED) {
                    return BigDecimal.valueOf(rs, newScale);
                }
                let rb = this.bigMultiplyPowerTen(raise);
                return new BigDecimal(rb, BigDecimal.INFLATED, newScale, (this.precision > 0) ? this.precision + raise : 0);
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                let drop = BigDecimal.checkScale(oldScale - newScale);
                if (drop < BigDecimal.TEN_POWERS_TABLE.length) {
                    return BigDecimal.divideAndRound2(rs, BigDecimal.TEN_POWERS_TABLE[drop], newScale, roundingMode, newScale);
                } else {
                    return BigDecimal.divideAndRound3(this.inflated(), BigInt(10) ** BigInt(drop), newScale, roundingMode, newScale);
                }
            }
        } else {
            if (newScale > oldScale) {
                let raise = BigDecimal.checkScale(newScale - oldScale);
                let rb = BigDecimal.bigMultiplyPowerTen3(this.intVal, raise);
                return new BigDecimal(rb, BigDecimal.INFLATED, newScale, (this.precision > 0) ? this.precision + raise : 0);
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                let drop = BigDecimal.checkScale(oldScale - newScale);
                if (drop < BigDecimal.TEN_POWERS_TABLE.length)
                    return BigDecimal.divideAndRound4(this.intVal!, BigDecimal.TEN_POWERS_TABLE[drop], newScale, roundingMode, newScale);
                else
                    return BigDecimal.divideAndRound3(this.intVal!, BigInt(10) ** BigInt(drop), newScale, roundingMode, newScale);
            }
        }
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

    static divideAndRound2(ldividend: number, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number): BigDecimal {
        let qsign: number; // quotient sign
        let q = ldividend / ldivisor; // store quotient in long
        if (roundingMode == RoundingMode.DOWN && scale == preferredScale)
            return BigDecimal.valueOf(q, scale);
        let r = ldividend % ldivisor; // store remainder in long
        qsign = ((ldividend < 0) == (ldivisor < 0)) ? 1 : -1;
        if (r != 0) {
            let increment = BigDecimal.needIncrement(ldivisor, roundingMode, qsign, q, r);
            return BigDecimal.valueOf((increment ? q + qsign : q), scale);
        } else {
            if (preferredScale != scale)
                return BigDecimal.createAndStripZerosToMatchScale(q, scale, preferredScale);
            else
                return BigDecimal.valueOf(q, scale);
        }
    }

    static needIncrement(ldivisor: number, roundingMode: RoundingMode, qsign: number, q: number, r: number) {
        if (r === 0) throw new RangeError('Unexpected remainder');

        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1;
        } else {
            cmpFracHalf = BigDecimal.numberCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, (q & 1) !== 0);
    }

    static commonNeedIncrement(roundingMode: RoundingMode, qsign: number, cmpFracHalf: number, oddQuot: boolean): boolean {
        switch (roundingMode) {
            case RoundingMode.UNNECESSARY:
                throw new RangeError('Rounding necessary');

            case RoundingMode.UP: // Away from zero
                return true;

            case RoundingMode.DOWN: // Towards zero
                return false;

            case RoundingMode.CEILING: // Towards +infinity
                return qsign > 0;

            case RoundingMode.FLOOR: // Towards -infinity
                return qsign < 0;

            default: // Some kind of half-way rounding
                if (!(roundingMode >= RoundingMode.HALF_UP && roundingMode <= RoundingMode.HALF_EVEN))
                    throw new RangeError(`Unexpected rounding mode ${RoundingMode[roundingMode]}`)

                if (cmpFracHalf < 0) // We're closer to higher digit
                    return false;
                else if (cmpFracHalf > 0) // We're closer to lower digit
                    return true;
                else { // half-way
                    if (cmpFracHalf != 0) throw new RangeError('Expected cmp frac half to be zero');

                    switch (roundingMode) {
                        case RoundingMode.HALF_DOWN:
                            return false;

                        case RoundingMode.HALF_UP:
                            return true;

                        case RoundingMode.HALF_EVEN:
                            return oddQuot;

                        default:
                            throw new RangeError(`Unexpected rounding mode ${RoundingMode[roundingMode]}`);
                    }
                }
        }
    }

    static numberCompareMagnitude(x: number, y: number): number {
        if (x < 0)
            x = -x;
        if (y < 0)
            y = -y;
        return (x < y) ? -1 : ((x == y) ? 0 : 1);
    }

    static bigIntCompareMagnitude(x: BigInt, y: BigInt): number {
        if (x < 0n)
            x = -1n * x.valueOf();
        if (y < 0n)
            y = -1n * y.valueOf();
        return (x < y) ? -1 : ((x == y) ? 0 : 1);
    }

    static bigIntToBigDecimal(bigInt: BigInt, qsign: number, scale: number): BigDecimal {
        if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER) && bigInt >= BigInt(Number.MIN_SAFE_INTEGER)) {
            const numberForm = Number(bigInt);
            return new BigDecimal(null, qsign * numberForm, scale, BigDecimal.numberDigitLength(numberForm));
        } else {
            return new BigDecimal(BigInt(qsign) * bigInt.valueOf(), BigDecimal.INFLATED, scale, bigInt.toString().length);
        }
    }

    static bigIntToCompactValue(bigInt: BigInt, qsign: number): number {
        if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER) && bigInt >= BigInt(Number.MIN_SAFE_INTEGER)) {
            return qsign * Number(bigInt);
        } else {
            return BigDecimal.INFLATED;
        }
    }

    static divideAndRound3(bdividend: BigInt, bdivisor: BigInt, scale: number, roundingMode: RoundingMode, preferredScale: number): BigDecimal {
        let mq = bdividend.valueOf() / bdivisor.valueOf();
        const mr = bdividend.valueOf() % bdivisor.valueOf();
        const isRemainderZero = mr === 0n;
        const qsign = (BigDecimal.bigIntSignum(bdividend) != BigDecimal.bigIntSignum(bdivisor)) ? -1 : 1;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement2(bdivisor, roundingMode, qsign, mq, mr)) {
                mq += BigInt(1);
            }
            return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
        } else {
            if (preferredScale != scale) {
                const compactVal = BigDecimal.bigIntToCompactValue(mq, qsign);
                if (compactVal != BigDecimal.INFLATED) {
                    return BigDecimal.createAndStripZerosToMatchScale(compactVal, scale, preferredScale);
                }
                const intVal = BigInt(qsign) * mq.valueOf();
                return BigDecimal.createAndStripZerosToMatchScale2(intVal, scale, preferredScale);
            } else {
                return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
            }
        }
    }

    static needIncrement2(mdivisor: BigInt, roundingMode: RoundingMode, qsign: number, mq: BigInt, mr: BigInt): boolean {
        if (mr === 0n) throw new RangeError('Unexpected remainder');

        const cmpFracHalf = BigDecimal.compareHalf(mr, mq);

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, mq.valueOf() % 2n === 1n);
    }


    static compareHalf(mr: BigInt, mq: BigInt) {
        mq = mq.valueOf() / 2n;
        if (mr < 0n)
            mr = -1n * mr.valueOf();
        if (mq < 0n)
            mq = -1n * mq.valueOf();
        return (mr < mr) ? -1 : ((mr == mq) ? 0 : 1);
    }

    static divideAndRound4(bdividend: BigInt, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number) {
        let mq = bdividend.valueOf() / BigInt(ldivisor);
        const mr = Number(bdividend) % ldivisor;
        const isRemainderZero = mr === 0;
        const qsign = (ldivisor < 0) ? -BigDecimal.bigIntSignum(bdividend) : BigDecimal.bigIntSignum(bdividend);
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement3(ldivisor, roundingMode, qsign, mq, mr)) {
                mq += BigInt(1);
            }
            return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
        } else {
            if (preferredScale != scale) {
                const compactVal = BigDecimal.bigIntToCompactValue(mq, qsign);
                if (compactVal != BigDecimal.INFLATED) {
                    return BigDecimal.createAndStripZerosToMatchScale(compactVal, scale, preferredScale);
                }
                const intVal = BigInt(qsign) * mq.valueOf();
                return BigDecimal.createAndStripZerosToMatchScale2(intVal, scale, preferredScale);
            } else {
                return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
            }
        }
    }

    static needIncrement3(ldivisor: any, roundingMode: RoundingMode, qsign: number, mq: BigInt, r: number) {
        if (r === 0) throw new RangeError('Unexpected remainder');

        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1; // 2 * r can't fit into long
        } else {
            cmpFracHalf = BigDecimal.numberCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, mq.valueOf() % 2n === 1n);
    }

    movePointLeft(n: number): BigDecimal {
        if (n == 0) return this;

        let newScale = BigDecimal.checkScale(this.scale + n);
        let num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num.scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    movePointRight(n: number): BigDecimal {
        if (n == 0) return this;

        let newScale = BigDecimal.checkScale(this.scale - n);
        let num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num.scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    min(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) <= 0 ? this : val);
    }

    max(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) >= 0 ? this : val);
    }

    toString(): string {
        let sc = this.stringCache;
        if (sc === undefined) {
            this.stringCache = sc = this.layoutChars(true);
        }
        return sc;
    }

    toEngineeringString(): string {
        return this.layoutChars(false);
    }

    layoutChars(sci: boolean): string {
        if (this.scale == 0)                      // zero scale is trivial
            return (intCompact != BigDecimal.INFLATED) ?
                Long.toString(intCompact) :
                intVal.toString();
        if (scale == 2 &&
            intCompact >= 0 && intCompact < Integer.MAX_VALUE) {
            // currency fast path
            int
            lowInt = (int)
            intCompact % 100;
            int
            highInt = (int)
            intCompact / 100;
            return (Integer.toString(highInt) + '.' +
                StringBuilderHelper.DIGIT_TENS[lowInt] +
                StringBuilderHelper.DIGIT_ONES[lowInt]);
        }

        StringBuilderHelper
        sbHelper = new StringBuilderHelper();
        char[]
        coeff;
        int
        offset;  // offset is the starting index for coeff array
        // Get the significand as an absolute value
        if (intCompact != BigDecimal.INFLATED) {
            offset = sbHelper.putIntCompact(Math.abs(intCompact));
            coeff = sbHelper.getCompactCharArray();
        } else {
            offset = 0;
            coeff = intVal.abs().toString().toCharArray();
        }

        // Construct a buffer, with sufficient capacity for all cases.
        // If E-notation is needed, length will be: +1 if negative, +1
        // if '.' needed, +2 for "E+", + up to 10 for adjusted exponent.
        // Otherwise it could have +1 if negative, plus leading "0.00000"
        StringBuilder
        buf = sbHelper.getStringBuilder();
        if (signum() < 0)             // prefix '-' if negative
            buf.append('-');
        int
        coeffLen = coeff.length - offset;
        long
        adjusted = -
            scale + (coeffLen - 1);
        if ((scale >= 0) && (adjusted >= -6)) { // plain number
            int
            pad = scale - coeffLen;         // count of padding zeros
            if (pad >= 0) {                     // 0.xxx form
                buf.append('0');
                buf.append('.');
                for (; pad > 0; pad--) {
                    buf.append('0');
                }
                buf.append(coeff, offset, coeffLen);
            } else {                         // xx.xx form
                buf.append(coeff, offset, -pad);
                buf.append('.');
                buf.append(coeff, -pad + offset, scale);
            }
        } else { // E-notation is needed
            if (sci) {                       // Scientific notation
                buf.append(coeff[offset]);   // first character
                if (coeffLen > 1) {          // more to come
                    buf.append('.');
                    buf.append(coeff, offset + 1, coeffLen - 1);
                }
            } else {                         // Engineering notation
                int
                sig = (int)(adjusted % 3);
                if (sig < 0)
                    sig += 3;                // [adjusted was negative]
                adjusted -= sig;             // now a multiple of 3
                sig++;
                if (signum() == 0) {
                    switch (sig) {
                        case 1:
                            buf.append('0'); // exponent is a multiple of three
                            break;
                        case 2:
                            buf.append('0.00');
                            adjusted += 3;
                            break;
                        case 3:
                            buf.append('0.0');
                            adjusted += 3;
                            break;
                        default:
                            throw new AssertionError('Unexpected sig value ' + sig);
                    }
                } else if (sig >= coeffLen) {   // significand all in integer
                    buf.append(coeff, offset, coeffLen);
                    // may need some zeros, too
                    for (int i = sig - coeffLen;
                    i > 0;
                    i--
                )
                    {
                        buf.append('0');
                    }
                } else {                     // xx.xxE form
                    buf.append(coeff, offset, sig);
                    buf.append('.');
                    buf.append(coeff, offset + sig, coeffLen - sig);
                }
            }
            if (adjusted != 0) {             // [!sci could have made 0]
                buf.append('E');
                if (adjusted > 0)            // force sign for positive
                    buf.append('+');
                buf.append(adjusted);
            }
        }
        return buf.toString();
    }

    toPlainString(): string {
        if (this.scale == 0) {
            if (intCompact != BigDecimal.INFLATED) {
                return Long.toString(intCompact);
            } else {
                return intVal.toString();
            }
        }
        if (this.scale < 0) { // No decimal point
            if (signum() == 0) {
                return '0';
            }
            int
            trailingZeros = BigDecimal.checkScale(-this.scale);
            StringBuilder
            buf;
            if (intCompact != BigDecimal.INFLATED) {
                buf = new StringBuilder(20 + trailingZeros);
                buf.append(intCompact);
            } else {
                String
                str = intVal.toString();
                buf = new StringBuilder(str.length() + trailingZeros);
                buf.append(str);
            }
            for (int i = 0;
            i < trailingZeros;
            i++
        )
            {
                buf.append('0');
            }
            return buf.toString();
        }
        String
        str;
        if (intCompact != BigDecimal.INFLATED) {
            str = Long.toString(Math.abs(intCompact));
        } else {
            str = intVal.abs().toString();
        }
        return getValueString(signum(), str, scale);
    }

    getValueString(signum: number, intString: string, scale: number): string {
        /* Insert decimal point */
        StringBuilder
        buf;
        int
        insertionPoint = intString.length() - scale;
        if (insertionPoint == 0) {  /* Point goes right before intVal */
            return (signum < 0 ? '-0.' : '0.') + intString;
        } else if (insertionPoint > 0) { /* Point goes inside intVal */
            buf = new StringBuilder(intString);
            buf.insert(insertionPoint, '.');
            if (signum < 0)
                buf.insert(0, '-');
        } else { /* We must insert zeros between point and intVal */
            buf = new StringBuilder(3 - insertionPoint + intString.length());
            buf.append(signum < 0 ? '-0.' : '0.');
            for (int i = 0;
            i < -insertionPoint;
            i++
        )
            {
                buf.append('0');
            }
            buf.append(intString);
        }
        return buf.toString();
    }

    toBigInteger(): BigInt {
        return this.setScale(0, RoundingMode.DOWN).inflated();
    }

    toBigIntegerExact(): BigInt {
        return this.setScale(0, RoundingMode.UNNECESSARY).inflated();
    }

    fractionOnly(): boolean {
        if (this.signum() == 0) throw new RangeError('Signum should be zero');
        return (this.precision - this.scale) <= 0;
    }

    static BigDecimal
.

    checkScale(val: number) {
        int
        asInt = val;
        if (asInt != val) {
            throw new ArithmeticException(asInt > 0 ? 'Underflow' : 'Overflow');
        }
        return asInt;
    }

    static divideAndRound5(bdividend: BigIntOrNull, ldivisor: number, roundingMode: number): BigInt {
        return 0n;
    }

    static divideAndRound6(bdividend: BigIntOrNull, bdivisor: BigIntOrNull, roundingMode: number): BigInt {
        return 0n;
    }

    static divideSmallFastPath(xs: number, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext) {
        int
        mcp = mc.precision;
        int
        roundingMode = mc.roundingMode;

        assert(xscale <= yscale) && (yscale < 18) && (mcp < 18);
        int
        xraise = yscale - xscale; // xraise >=0
        long
        scaledX = (xraise == 0) ? xs :
            longMultiplyPowerTen(xs, xraise); // can't overflow here!
        BigDecimal
        quotient;

        int
        cmp = longCompareMagnitude(scaledX, ys);
        if (cmp > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
            int
            scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
            if (BigDecimal.checkScale(mcp + yscale - xscale
                ) >
                0
            ) {
                // assert newScale >= xscale
                int
                raise = BigDecimal.checkScale(
                    mcp + yscale - xscale
                )
                ;
                long
                scaledXs;
                if ((scaledXs = longMultiplyPowerTen(xs, raise)) == BigDecimal.INFLATED) {
                    quotient = null;
                    if ((mcp - 1) >= 0 && (mcp - 1) < BigDecimal.TEN_POWERS_TABLE.length) {
                        quotient = Bigdecimal.multiplyDivideAndRound(BigDecimal.TEN_POWERS_TABLE[mcp - 1], scaledX, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    }
                    if (quotient == null) {
                        BigInteger
                        rb = bigMultiplyPowerTen(scaledX, mcp - 1);
                        quotient = divideAndRound(rb, ys,
                            scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    }
                } else {
                    quotient = divideAndRound(scaledXs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                }
            } else {
                int
                newScale = BigDecimal.checkScale(
                    xscale - mcp
                )
                ;
                // assert newScale >= yscale
                if (newScale == yscale) { // easy case
                    quotient = divideAndRound(xs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                } else {
                    int
                    raise = BigDecimal.checkScale(
                        newScale - yscale
                    )
                    ;
                    long
                    scaledYs;
                    if ((scaledYs = longMultiplyPowerTen(ys, raise)) == BigDecimal.INFLATED) {
                        BigInteger
                        rb = bigMultiplyPowerTen(ys, raise);
                        quotient = divideAndRound(BigInteger.valueOf(xs),
                            rb, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    } else {
                        quotient = divideAndRound(xs, scaledYs, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    }
                }
            }
        } else {
            // abs(scaledX) <= abs(ys)
            // result is "scaledX * 10^msp / ys"
            int
            scl = BigDecimal.checkScale(preferredScale + yscale - xscale + mcp);
            if (cmp == 0) {
                // abs(scaleX)== abs(ys) => result will be scaled 10^mcp + correct sign
                quotient = roundedTenPower(((scaledX < 0) == (ys < 0)) ? 1 : -1, mcp, scl, BigDecimal.checkScale(preferredScale));
            } else {
                // abs(scaledX) < abs(ys)
                long
                scaledXs;
                if ((scaledXs = longMultiplyPowerTen(scaledX, mcp)) == BigDecimal.INFLATED) {
                    quotient = null;
                    if (mcp < BigDecimal.TEN_POWERS_TABLE.length) {
                        quotient = multiplyDivideAndRound(BigDecimal.TEN_POWERS_TABLE[mcp], scaledX, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    }
                    if (quotient == null) {
                        BigInteger
                        rb = bigMultiplyPowerTen(scaledX, mcp);
                        quotient = divideAndRound(rb, ys,
                            scl, roundingMode, BigDecimal.checkScale(preferredScale));
                    }
                } else {
                    quotient = divideAndRound(scaledXs, ys, scl, roundingMode, BigDecimal.checkScale(preferredScale));
                }
            }
        }
        // doRound, here, only affects 1000000000 case.
        return doRound(quotient, mc);
    }

    static multiplyDivideAndRound(dividend0: number, dividend1: number, divisor: number, scale: number, roundingMode: number, preferredScale: number): BigDecimal {
        int
        qsign = Long.signum(dividend0) * Long.signum(dividend1) * Long.signum(divisor);
        dividend0 = Math.abs(dividend0);
        dividend1 = Math.abs(dividend1);
        divisor = Math.abs(divisor);
        // multiply dividend0 * dividend1
        long
        d0_hi = dividend0 >>> 32;
        long
        d0_lo = dividend0 & LONG_MASK;
        long
        d1_hi = dividend1 >>> 32;
        long
        d1_lo = dividend1 & LONG_MASK;
        long
        product = d0_lo * d1_lo;
        long
        d0 = product & LONG_MASK;
        long
        d1 = product >>> 32;
        product = d0_hi * d1_lo + d1;
        d1 = product & LONG_MASK;
        long
        d2 = product >>> 32;
        product = d0_lo * d1_hi + d1;
        d1 = product & LONG_MASK;
        d2 += product >>> 32;
        long
        d3 = d2 >>> 32;
        d2 &= LONG_MASK;
        product = d0_hi * d1_hi + d2;
        d2 = product & LONG_MASK;
        d3 = ((product >>> 32) + d3) & LONG_MASK;
        final
        long
        dividendHi = make64(d3, d2);
        final
        long
        dividendLo = make64(d1, d0);
        // divide
        return divideAndRound128(dividendHi, dividendLo, divisor, qsign, scale, roundingMode, preferredScale);
    }

    static roundedTenPower(qsign: number, raise: number, scale: number, preferredScale: number): BigDecimal {
        if (scale > preferredScale) {
            int
            diff = scale - preferredScale;
            if (diff < raise) {
                return scaledTenPow(raise - diff, qsign, preferredScale);
            } else {
                return valueOf(qsign, scale - raise);
            }
        } else {
            return scaledTenPow(raise, qsign, scale);
        }
    }

    static scaledTenPow(n: number, sign: number, scale: number): BigDecimal {
        if (n < BigDecimal.TEN_POWERS_TABLE.length)
            return valueOf(sign * BigDecimal.TEN_POWERS_TABLE[n], scale);
        else {
            BigInteger
            unscaledVal = bigTenToThe(n);
            if (sign == -1) {
                unscaledVal = unscaledVal.negate();
            }
            return new BigDecimal(unscaledVal, BigDecimal.INFLATED, scale, n + 1);
        }
    }

    static compareMagnitudeNormalized(xs: number, xscale: number, ys: number, yscale: number): number {
        // assert xs!=0 && ys!=0
        int
        sdiff = xscale - yscale;
        if (sdiff != 0) {
            if (sdiff < 0) {
                xs = longMultiplyPowerTen(xs, -sdiff);
            } else { // sdiff > 0
                ys = longMultiplyPowerTen(ys, sdiff);
            }
        }
        if (xs != BigDecimal.INFLATED)
            return (ys != BigDecimal.INFLATED) ? longCompareMagnitude(xs, ys) : -1;
        else
            return 1;
    }

    static compareMagnitudeNormalized(xs: number, xscale: number, ys: BigInt, yscale: number): number {
        // assert "ys can't be represented as long"
        if (xs == 0)
            return -1;
        int
        sdiff = xscale - yscale;
        if (sdiff < 0) {
            if (longMultiplyPowerTen(xs, -sdiff) == BigDecimal.INFLATED) {
                return bigMultiplyPowerTen(xs, -sdiff).compareMagnitude(ys);
            }
        }
        return -1;
    }

    // Compare Normalize dividend & divisor so that both fall into [0.1, 0.999...]
    static compareMagnitudeNormalized(xs: BigInt, xscale: number, ys: BigInt, yscale: number): number {
        int
        sdiff = xscale - yscale;
        if (sdiff < 0) {
            return bigMultiplyPowerTen(xs, -sdiff).compareMagnitude(ys);
        } else { // sdiff >= 0
            return xs.compareMagnitude(bigMultiplyPowerTen(ys, sdiff));
        }
    }

    static doRound128(hi: number, lo: number, sign: number, scale: number, mc: MathContext): BigDecimal {
        int
        mcp = mc.precision;
        int
        drop;
        BigDecimal
        res = null;
        if (((drop = precision(hi, lo) - mcp) > 0) && (drop < BigDecimal.TEN_POWERS_TABLE.length)) {
            scale = BigDecimal.checkScale(
                scale - drop
            )
            ;
            res = divideAndRound128(hi, lo, BigDecimal.TEN_POWERS_TABLE[drop], sign, scale, mc.roundingMode, scale);
        }
        if (res != null) {
            return doRound(res, mc);
        }
        return null;
    }

    static precision(hi: number, lo: number): number {
        if (hi == 0) {
            if (lo >= 0) {
                return BigDecimal.numberDigitLength(lo);
            }
            return (unsignedLongCompareEq(lo, BigDecimal.TEN_POWERS_TABLE[0][1])) ? 20 : 19;
            // 0x8AC7230489E80000L  = unsigned 2^19
        }
        int
        r = ((128 - Long.numberOfLeadingZeros(hi) + 1) * 1233) >>> 12;
        int
        idx = r - 19;
        return (idx >= BigDecimal.TEN_POWERS_TABLE.length || longLongCompareMagnitude(hi, lo,
            BigDecimal.TEN_POWERS_TABLE[idx][0], BigDecimal.TEN_POWERS_TABLE[idx][1])) ? r : r + 1;
    }

    static longLongCompareMagnitude(hi0: number, lo0: number, hi1: number, lo1: number): boolean {
        if (hi0 != hi1) {
            return hi0 < hi1;
        }
        return (lo0 + Number.MIN_SAFE_INTEGER) < (lo1 + Number.MIN_SAFE_INTEGER);
    }

    static unsignedLongCompareEq(one: number, two: number): boolean {
        return (one + Number.MIN_SAFE_INTEGER) >= (two + Number.MIN_SAFE_INTEGER);
    }
}


export default BigDecimal;
