'use strict';
// Single source of truth for every benchmarked operation. Each entry maps an
// operation name to one loop-body function per library; index.js builds a
// Benchmark.Suite from it and prints the comparison table. Libraries that lack
// an operation simply omit their key and show '-' in the report.
//
// Operands come from ../test_numbers (one pre-constructed array per library, so
// we measure the operation, not construction/coercion). sqrt uses non-negative
// operands.

const { Big: BigJs } = require('big.js');
const { BigNumber } = require('bignumber.js');
const Decimal = require('decimal.js');
const { BigDecimal: GWTDecimal, MathContext: GWTMathContext } = require('bigdecimal');
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');
const {
    bigDecimalStrings,
    bigDecimals, bigDecimalsBigjs, bigDecimalsBigNumber, bigDecimalsDecimal, bigDecimalsGWT,
} = require('./test_numbers');

// Rounding-mode constants (HALF_UP) per library's own encoding.
const HU = RoundingMode.HALF_UP;   // bigdecimal.js (4)
const BIGJS_HU = 1;                // big.js
const BN_HU = 4;                   // bignumber.js
const DEC_HU = 4;                  // decimal.js
const GWT_HU = 4;                  // bigdecimal (GWT) accepts the int ordinal
const gwtMc = (p) => new GWTMathContext(`precision=${p} roundingMode=HALF_UP`);

const PREC = 50;   // working precision for divide / sqrt / negative pow
const MUL_PREC = 99;

// Non-negative operands for sqrt (each library's own type).
const pos = bigDecimals.map((x) => x.abs());
const posBigjs = bigDecimalsBigjs.map((x) => x.abs());
const posBN = bigDecimalsBigNumber.map((x) => x.abs());
const posDec = bigDecimalsDecimal.map((x) => x.abs());

// Loop helpers. `pairs` walks consecutive operands; `each` walks single values.
const pairs = (arr, fn) => { for (let i = 0; i < arr.length - 1; i++) fn(arr[i], arr[i + 1], i); };
const each = (arr, fn) => { for (let i = 0; i < arr.length; i++) fn(arr[i], i); };

const ctorValues = [...bigDecimalStrings, ...bigDecimalStrings.map((v) => Number(v))];
const posExp = [0, 1, 2, 10, 99];
const negExp = [-1, -2, -10, -99];

// setup() runs once before an operation's suite (e.g. to configure precision).
const configureScaled = () => {
    BigJs.DP = PREC;
    BigNumber.config({ DECIMAL_PLACES: PREC });
    Decimal.set({ precision: PREC });
};

const operations = [
    {
        name: 'Constructor',
        libs: {
            'Bigdecimal.js': () => each(ctorValues, (v) => Big(v)),
            'Big.js': () => each(ctorValues, (v) => BigJs(v)),
            'BigNumber.js': () => each(ctorValues, (v) => BigNumber(v)),
            'decimal.js': () => each(ctorValues, (v) => Decimal(v)),
            'GWTBased': () => each(ctorValues, (v) => GWTDecimal(v)),
        },
    },
    {
        name: 'Add',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.add(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.plus(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.plus(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.plus(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.add(b)),
        },
    },
    {
        name: 'Subtract',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.subtract(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.minus(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.minus(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.minus(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.subtract(b)),
        },
    },
    {
        name: 'Multiply',
        setup: () => Decimal.set({ precision: MUL_PREC }),
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.multiply(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.times(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.multipliedBy(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.times(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.multiply(b)),
        },
    },
    {
        name: 'Divide',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.divideWithMathContext(b, MC(PREC, HU))),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.div(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.dividedBy(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.dividedBy(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.divide(b, gwtMc(PREC))),
        },
    },
    {
        name: 'DivideToIntegralValue',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.divideToIntegralValue(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.idiv(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.divToInt(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.divideToIntegralValue(b)),
        },
    },
    {
        name: 'Remainder',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.remainder(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.mod(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.modulo(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.mod(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.remainder(b)),
        },
    },
    {
        name: 'Positive pow',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, _b, i) => a.pow(posExp[i % posExp.length])),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, _b, i) => a.pow(posExp[i % posExp.length])),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, _b, i) => a.pow(posExp[i % posExp.length])),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, _b, i) => a.pow(posExp[i % posExp.length])),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, _b, i) => a.pow(posExp[i % posExp.length])),
        },
    },
    {
        name: 'Negative pow',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, _b, i) => a.pow(negExp[i % negExp.length], MC(PREC, HU))),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, _b, i) => a.pow(negExp[i % negExp.length])),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, _b, i) => a.pow(negExp[i % negExp.length])),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, _b, i) => a.pow(negExp[i % negExp.length])),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, _b, i) => a.pow(negExp[i % negExp.length], gwtMc(PREC))),
        },
    },
    {
        name: 'Sqrt',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => each(pos, (a) => a.sqrt(MC(PREC, HU))),
            'Big.js': () => each(posBigjs, (a) => a.sqrt()),
            'BigNumber.js': () => each(posBN, (a) => a.sqrt()),
            'decimal.js': () => each(posDec, (a) => a.sqrt()),
        },
    },
    {
        name: 'Abs',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.abs()),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.abs()),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.abs()),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.abs()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.abs()),
        },
    },
    {
        name: 'Negate',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.negate()),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.neg()),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.negated()),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.negated()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.negate()),
        },
    },
    {
        name: 'Round',   // to significant digits (MathContext-style)
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.round(MC(20, HU))),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.prec(20, BIGJS_HU)),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.toSignificantDigits(20, DEC_HU)),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.round(gwtMc(20))),
        },
    },
    {
        name: 'SetScale',   // round to a fixed number of decimal places
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.setScale(10, HU)),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.round(10, BIGJS_HU)),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.dp(10, BN_HU)),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.toDP(10, DEC_HU)),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.setScale(10, GWT_HU)),
        },
    },
    {
        name: 'Compare',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.compareTo(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.cmp(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.comparedTo(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.comparedTo(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.compareTo(b)),
        },
    },
    {
        name: 'Equals',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.equals(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.eq(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.eq(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.eq(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.equals(b)),
        },
    },
    {
        name: 'Min',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.min(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => BigNumber.min(a, b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => Decimal.min(a, b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.min(b)),
        },
    },
    {
        name: 'Max',
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.max(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => BigNumber.max(a, b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => Decimal.max(a, b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.max(b)),
        },
    },
    {
        name: 'MovePointLeft',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.movePointLeft(3)),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.movePointLeft(3)),
        },
    },
    {
        name: 'MovePointRight',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.movePointRight(3)),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.movePointRight(3)),
        },
    },
    {
        name: 'ScaleByPowerOfTen',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.scaleByPowerOfTen(3)),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.shiftedBy(3)),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.scaleByPowerOfTen(3)),
        },
    },
    {
        name: 'StripTrailingZeros',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.stripTrailingZeros()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.stripTrailingZeros()),
        },
    },
    {
        name: 'Ulp',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.ulp()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.ulp()),
        },
    },
    {
        name: 'UnscaledValue',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.unscaledValue()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.unscaledValue()),
        },
    },
    {
        name: 'ToString',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.toString()),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.toString()),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.toString()),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.toString()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.toString()),
        },
    },
    {
        name: 'NumberValue',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.numberValue()),
            'Big.js': () => each(bigDecimalsBigjs, (a) => a.toNumber()),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a) => a.toNumber()),
            'decimal.js': () => each(bigDecimalsDecimal, (a) => a.toNumber()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.doubleValue()),
        },
    },
    {
        name: 'ToBigInt',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a) => a.toBigInt()),
            'GWTBased': () => each(bigDecimalsGWT, (a) => a.toBigInteger()),
        },
    },
];

// Library column order for the report.
const libNames = ['Bigdecimal.js', 'Big.js', 'BigNumber.js', 'decimal.js', 'GWTBased'];

module.exports = { operations, libNames };
