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
    compact, inflated, money,
} = require('./test_numbers');

// Rounding-mode constants (HALF_UP) per library's own encoding.
const HU = RoundingMode.HALF_UP; // bigdecimal.js (4)
const BIGJS_HU = 1; // big.js
const BN_HU = 4; // bignumber.js
const DEC_HU = 4; // decimal.js
const GWT_HU = 4; // bigdecimal (GWT) accepts the int ordinal
const gwtMc = (p) => new GWTMathContext(`precision=${p} roundingMode=HALF_UP`);

const PREC = 50; // working precision for divide / sqrt / negative pow

// decimal.js has no exact mode: every operation rounds to its configured `precision`
// significant digits, default 20. At that default it was truncating Add/Subtract
// results the other libraries kept in full, so it was measured doing strictly less
// work. EXACT_PREC is set high enough that no operand or product in this dataset is
// rounded, making the "exact arithmetic" rows a like-for-like comparison. Operands
// reach ~70 significant digits and products roughly double that.
const EXACT_PREC = 1000;

// Non-negative operands for sqrt (each library's own type).
const pos = bigDecimals.map((x) => x.abs());
const posBigjs = bigDecimalsBigjs.map((x) => x.abs());
const posBN = bigDecimalsBigNumber.map((x) => x.abs());
const posDec = bigDecimalsDecimal.map((x) => x.abs());

// Loop helpers. `pairs` walks consecutive operands; `each` walks single values.
//
// Both return the last computed result, which keeps the results live so the JIT
// cannot dead-code-eliminate the very work being measured.
//
// Both also record how many calls the batch made. Benchmark.js measures whole
// batches, so its `hz` is batches/sec, not operations/sec; index.js multiplies by
// this to report a true per-operation rate. It is assigned once per batch rather
// than incremented per call, so it costs nothing measurable.
//
// In collecting mode (verify.js only, never while timing) they additionally retain
// every result so the preflight can compare the whole stream rather than the single
// last value. The flag is read once per batch, not once per call, so the timed path
// is unaffected.
let lastBatchCalls = 0;
let collecting = false;
const batchResults = [];

const pairs = (arr, fn) => {
    const n = arr.length - 1;
    let last;
    if (collecting) {
        batchResults.length = 0;
        for (let i = 0; i < n; i++) batchResults.push(last = fn(arr[i], arr[i + 1], i));
    } else {
        for (let i = 0; i < n; i++) last = fn(arr[i], arr[i + 1], i);
    }
    lastBatchCalls = n;
    return last;
};
const each = (arr, fn) => {
    const n = arr.length;
    let last;
    if (collecting) {
        batchResults.length = 0;
        for (let i = 0; i < n; i++) batchResults.push(last = fn(arr[i], i));
    } else {
        for (let i = 0; i < n; i++) last = fn(arr[i], i);
    }
    lastBatchCalls = n;
    return last;
};

const getLastBatchCalls = () => lastBatchCalls;
const setCollecting = (on) => {
    collecting = on;
};
const getBatchResults = () => batchResults;

// Construction is split by input type because the two are not the same race.
//
// From a string, every library parses the same exact decimal and they all agree.
//
// From a `number`, they do not: half of this dataset does not round-trip through a
// double, and the GWT port then takes Java's `new BigDecimal(double)` reading — the
// exact binary value, -11222235657.23149871826171875 — while bigdecimal.js, big.js,
// BigNumber.js and decimal.js all take the shortest decimal that reproduces the double,
// -11222235657.231499, which is Java's `BigDecimal.valueOf(double)`. Both are defensible
// and the difference is the caller's to know about, so the number row is reported without
// a winner rather than being quietly made comparable by dropping the operands that expose
// it (which would also bias the row towards short values).
const ctorStrings = bigDecimalStrings;
const ctorNumbers = bigDecimalStrings.map((v) => Number(v));

// Exponents are kept moderate on purpose. With 69-digit operands an exponent of 99
// produces ~6800-digit results, so the row ends up measuring bigint growth rather than
// pow itself — which is what made it report a ~250x margin. 32 still exercises large
// intermediates without the extreme dominating the measurement.
const posExp = [0, 1, 2, 5, 10, 32];
const negExp = [-1, -2, -5, -10, -32];

// Argument sets for the rows whose cost depends materially on the argument, cycled by
// operand index. Round and SetScale are where big.js's digit-array representation wins,
// and SetScale varies ~1.4x across scales (non-monotonically), so a single hard-coded
// argument characterised neither the operation nor the size of that gap.
//
// PRECISIONS deliberately includes 15 and 16: MAX_COMPACT_DIGITS is 15, so that is
// exactly the boundary where a result either stays in a compact `number` or inflates to
// `BigInt` — the most interesting precision there is for this library.
const SCALES = [0, 2, 10, 16, 40];
const PRECISIONS = [1, 7, 15, 16, 20, 40];
const POINT_SHIFTS = [-40, -12, -3, 0, 1, 3, 12, 40];

// Negative scales (round to tens/hundreds/...) are valid BigDecimal and a real use, but
// decimal.js's toDP rejects them, so they get their own row rather than being cycled
// into the shared SetScale row and throwing.
const NEGATIVE_SCALES = [-40, -16, -10, -2];

const atIndex = (set, i) => set[i % set.length];

// MathContexts are hoisted out of the timed callbacks. Constructing one is not part of
// the operation being measured, and building it inside the loop taxed only the libraries
// whose API takes a context per call — bigdecimal.js and the GWT port allocated a fresh
// context on every iteration while big.js and BigNumber.js read a global setting they
// were configured with once. That is a harness artefact, and it was penalising us.
const MC_PREC = MC(PREC, HU);
const GWT_MC_PREC = gwtMc(PREC);
const ROUND_MCS = PRECISIONS.map((p) => MC(p, HU));
const ROUND_GWT_MCS = PRECISIONS.map((p) => gwtMc(p));

// setup() runs once before an operation's suite (e.g. to configure precision).
//
// Every operation gets an explicit setup (see the defaulting below the table): these
// configure global, mutable library state, so without one each row would inherit
// whatever the previous row happened to leave behind, making results depend on table
// order.
const configureScaled = () => {
    BigJs.DP = PREC;
    BigNumber.config({ DECIMAL_PLACES: PREC });
    Decimal.set({ precision: PREC });
};

// For rows meant to measure exact arithmetic: give every library enough working
// precision that none of them rounds.
const configureExact = () => {
    BigJs.DP = EXACT_PREC;
    BigNumber.config({ DECIMAL_PLACES: EXACT_PREC });
    Decimal.set({ precision: EXACT_PREC });
};

const operations = [
    {
        name: 'Constructor (from string)',
        libs: {
            'Bigdecimal.js': () => each(ctorStrings, (v) => Big(v)),
            'Big.js': () => each(ctorStrings, (v) => BigJs(v)),
            'BigNumber.js': () => each(ctorStrings, (v) => BigNumber(v)),
            'decimal.js': () => each(ctorStrings, (v) => Decimal(v)),
            'GWTBased': () => each(ctorStrings, (v) => GWTDecimal(v)),
        },
    },
    {
        name: 'Constructor (from number)',
        notComparable: 'GWT reads the exact binary double; the others use the shortest repr',
        libs: {
            'Bigdecimal.js': () => each(ctorNumbers, (v) => Big(v)),
            'Big.js': () => each(ctorNumbers, (v) => BigJs(v)),
            'BigNumber.js': () => each(ctorNumbers, (v) => BigNumber(v)),
            'decimal.js': () => each(ctorNumbers, (v) => Decimal(v)),
            'GWTBased': () => each(ctorNumbers, (v) => GWTDecimal(v)),
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
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.multiply(b)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.times(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.multipliedBy(b)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.times(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.multiply(b)),
        },
    },
    // Division is split by precision basis because the libraries do not share one.
    // big.js and BigNumber.js can only divide to a number of DECIMAL PLACES (DP /
    // DECIMAL_PLACES); bigdecimal.js, decimal.js and the GWT port divide to a number
    // of SIGNIFICANT DIGITS (MathContext / precision). Running all five in one row
    // under a single "PREC = 50" label compared different amounts of work — for an
    // operand with a large integer part, 50 decimal places is far more digits than 50
    // significant digits. Each row below asks every library for the same quantity of
    // result, and libraries that cannot express that basis natively are omitted.
    {
        name: 'Divide (50 significant digits)',
        precisionBasis: 'significant-digits',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.divideWithMathContext(b, MC_PREC)),
            'decimal.js': () => pairs(bigDecimalsDecimal, (a, b) => a.dividedBy(b)),
            'GWTBased': () => pairs(bigDecimalsGWT, (a, b) => a.divide(b, GWT_MC_PREC)),
        },
    },
    {
        name: 'Divide (50 decimal places)',
        precisionBasis: 'decimal-places',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => pairs(bigDecimals, (a, b) => a.divide(b, PREC, HU)),
            'Big.js': () => pairs(bigDecimalsBigjs, (a, b) => a.div(b)),
            'BigNumber.js': () => pairs(bigDecimalsBigNumber, (a, b) => a.dividedBy(b)),
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
        // Unary, so it walks operands with `each`. It used `pairs`, which ignored its
        // second operand and therefore silently skipped the last value in the array.
        name: 'Positive pow',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.pow(atIndex(posExp, i))),
            'Big.js': () => each(bigDecimalsBigjs, (a, i) => a.pow(atIndex(posExp, i))),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a, i) => a.pow(atIndex(posExp, i))),
            'decimal.js': () => each(bigDecimalsDecimal, (a, i) => a.pow(atIndex(posExp, i))),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.pow(atIndex(posExp, i))),
        },
    },
    {
        // Mixed basis, and not splittable: bigdecimal.js has no decimal-places pow —
        // a negative exponent requires a MathContext. So bigdecimal.js/decimal.js/GWT
        // work to 50 significant digits here while big.js/BigNumber.js work to 50
        // decimal places. Footnoted in the report rather than presented as a clean win.
        name: 'Negative pow',
        precisionBasis: 'mixed',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.pow(atIndex(negExp, i), MC_PREC)),
            'Big.js': () => each(bigDecimalsBigjs, (a, i) => a.pow(atIndex(negExp, i))),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a, i) => a.pow(atIndex(negExp, i))),
            'decimal.js': () => each(bigDecimalsDecimal, (a, i) => a.pow(atIndex(negExp, i))),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.pow(atIndex(negExp, i), GWT_MC_PREC)),
        },
    },
    {
        // Mixed basis, same reason as Negative pow: bigdecimal.js sqrt takes a
        // MathContext (significant digits) and has no decimal-places form, while
        // big.js/BigNumber.js sqrt honours their decimal-places setting.
        name: 'Sqrt',
        precisionBasis: 'mixed',
        setup: configureScaled,
        libs: {
            'Bigdecimal.js': () => each(pos, (a) => a.sqrt(MC_PREC)),
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
        name: 'Round', // to significant digits (MathContext-style), cycling PRECISIONS
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.round(atIndex(ROUND_MCS, i))),
            'Big.js': () => each(bigDecimalsBigjs, (a, i) => a.prec(atIndex(PRECISIONS, i), BIGJS_HU)),
            'decimal.js': () => each(bigDecimalsDecimal, (a, i) => a.toSignificantDigits(atIndex(PRECISIONS, i), DEC_HU)),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.round(atIndex(ROUND_GWT_MCS, i))),
        },
    },
    {
        name: 'SetScale', // round to a number of decimal places, cycling SCALES
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.setScale(atIndex(SCALES, i), HU)),
            'Big.js': () => each(bigDecimalsBigjs, (a, i) => a.round(atIndex(SCALES, i), BIGJS_HU)),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a, i) => a.dp(atIndex(SCALES, i), BN_HU)),
            'decimal.js': () => each(bigDecimalsDecimal, (a, i) => a.toDP(atIndex(SCALES, i), DEC_HU)),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.setScale(atIndex(SCALES, i), GWT_HU)),
        },
    },
    {
        // Negative scales round to tens/hundreds/... decimal.js is absent because its
        // toDP rejects a negative argument; the other four support it natively.
        name: 'SetScale (negative scales)',
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.setScale(atIndex(NEGATIVE_SCALES, i), HU)),
            'Big.js': () => each(bigDecimalsBigjs, (a, i) => a.round(atIndex(NEGATIVE_SCALES, i), BIGJS_HU)),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a, i) => a.dp(atIndex(NEGATIVE_SCALES, i), BN_HU)),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.setScale(atIndex(NEGATIVE_SCALES, i), GWT_HU)),
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
        // Not comparable, and no amount of operand choice fixes it: bigdecimal.js follows
        // Java, where equals() is scale-SENSITIVE — 2.0 and 2.00 are not equal — while
        // every other library here does numeric equality. They answer different questions,
        // so the row is reported without a winner. compareTo/cmp (the Compare row above) is
        // the like-for-like numeric comparison. The preflight cannot catch this on its own:
        // consecutive operands in the dataset differ numerically, so both semantics return
        // false throughout and the results agree by coincidence.
        name: 'Equals',
        notComparable: 'scale-sensitive (Java equals) vs numeric equality',
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
        name: 'MovePointLeft', // cycling POINT_SHIFTS
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.movePointLeft(atIndex(POINT_SHIFTS, i))),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.movePointLeft(atIndex(POINT_SHIFTS, i))),
        },
    },
    {
        name: 'MovePointRight', // cycling POINT_SHIFTS
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.movePointRight(atIndex(POINT_SHIFTS, i))),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.movePointRight(atIndex(POINT_SHIFTS, i))),
        },
    },
    {
        name: 'ScaleByPowerOfTen', // cycling POINT_SHIFTS
        libs: {
            'Bigdecimal.js': () => each(bigDecimals, (a, i) => a.scaleByPowerOfTen(atIndex(POINT_SHIFTS, i))),
            'BigNumber.js': () => each(bigDecimalsBigNumber, (a, i) => a.shiftedBy(atIndex(POINT_SHIFTS, i))),
            'GWTBased': () => each(bigDecimalsGWT, (a, i) => a.scaleByPowerOfTen(atIndex(POINT_SHIFTS, i))),
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
        // The rate is real but it is not per-call formatting cost. bigdecimal.js memoises
        // toString() on the instance, and Benchmark.js re-runs the batch over the same
        // operand array thousands of times, so every batch after the first reads a warm
        // cache. That is a genuine advantage for the common pattern of serialising the same
        // value repeatedly (none of the other libraries cache), but a caller formatting a
        // freshly computed value pays the full cost once. Noted rather than disqualified:
        // every library is asked to do the same thing, ours is just able to skip it.
        name: 'ToString',
        note: 'bigdecimal.js memoises toString per instance; repeated calls on the same value read a warm cache',
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

// Representation cohorts: the same core arithmetic, run separately over operands that
// stay on bigdecimal.js's compact (<= 15-digit `number`) path and operands that force
// the inflated (`bigint`) path. The main table above blends the two, and because a
// blended rate is dominated by the slower operands it lands near the inflated figure —
// hiding the compact fast path that is the library's central performance premise.
// Rendered as a separate table so the main one keeps its shape.
const cohortOperations = [];
for (const [label, set] of [['compact', compact], ['inflated', inflated], ['money', money]]) {
    cohortOperations.push(
        {
            name: `Add (${label})`,
            cohort: label,
            libs: {
                'Bigdecimal.js': () => pairs(set.bigDecimals, (a, b) => a.add(b)),
                'Big.js': () => pairs(set.bigjs, (a, b) => a.plus(b)),
                'BigNumber.js': () => pairs(set.bigNumber, (a, b) => a.plus(b)),
                'decimal.js': () => pairs(set.decimal, (a, b) => a.plus(b)),
                'GWTBased': () => pairs(set.gwt, (a, b) => a.add(b)),
            },
        },
        {
            name: `Subtract (${label})`,
            cohort: label,
            libs: {
                'Bigdecimal.js': () => pairs(set.bigDecimals, (a, b) => a.subtract(b)),
                'Big.js': () => pairs(set.bigjs, (a, b) => a.minus(b)),
                'BigNumber.js': () => pairs(set.bigNumber, (a, b) => a.minus(b)),
                'decimal.js': () => pairs(set.decimal, (a, b) => a.minus(b)),
                'GWTBased': () => pairs(set.gwt, (a, b) => a.subtract(b)),
            },
        },
        {
            name: `Multiply (${label})`,
            cohort: label,
            libs: {
                'Bigdecimal.js': () => pairs(set.bigDecimals, (a, b) => a.multiply(b)),
                'Big.js': () => pairs(set.bigjs, (a, b) => a.times(b)),
                'BigNumber.js': () => pairs(set.bigNumber, (a, b) => a.multipliedBy(b)),
                'decimal.js': () => pairs(set.decimal, (a, b) => a.times(b)),
                'GWTBased': () => pairs(set.gwt, (a, b) => a.multiply(b)),
            },
        },
        {
            name: `Compare (${label})`,
            cohort: label,
            libs: {
                'Bigdecimal.js': () => pairs(set.bigDecimals, (a, b) => a.compareTo(b)),
                'Big.js': () => pairs(set.bigjs, (a, b) => a.cmp(b)),
                'BigNumber.js': () => pairs(set.bigNumber, (a, b) => a.comparedTo(b)),
                'decimal.js': () => pairs(set.decimal, (a, b) => a.comparedTo(b)),
                'GWTBased': () => pairs(set.gwt, (a, b) => a.compareTo(b)),
            },
        },
    );
}
operations.push(...cohortOperations);

// Every operation gets an explicit setup so no row inherits the previous row's global
// library configuration. Rows that did not ask for a specific precision want exact
// arithmetic.
for (const op of operations) {
    if (!op.setup) op.setup = configureExact;
}

// Library column order for the report.
const libNames = ['Bigdecimal.js', 'Big.js', 'BigNumber.js', 'decimal.js', 'GWTBased'];

module.exports = { operations, libNames, getLastBatchCalls, setCollecting, getBatchResults };
