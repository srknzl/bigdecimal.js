'use strict';
// Harness helpers: suite plumbing, plus the canonicalisation used by the
// output-equivalence preflight in index.js.
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');

function attachEventsAndRun(suite) {
    return suite.on('start', function () {
        console.log(this.name + ' benchmark:');
    }).on('cycle', function (event) {
        console.log(String(event.target));
    }).on('complete', function () {
        const fastest = this.filter('fastest')[0];
        console.log(`${fastest.name} is the fastest\n`);
    }).run();
}

/**
 * Normalise one library's result to a comparable decimal string.
 *
 * Each library formats differently (trailing zeros, exponent thresholds), so raw
 * toString() output is not comparable across libraries even when the values are
 * numerically identical. Parsing through our own Big and stripping trailing zeros
 * gives a single canonical form. Booleans (from equals) are just stringified.
 *
 * A native `bigint` must NOT be short-circuited here even though String() already gives
 * exact digits: toBigInt returns one while the GWT port returns an object, and the two
 * stringify the same integer in different forms (plain digits vs 7.2E+233). Sending both
 * through Big() is what makes them comparable — special-casing bigint reported a
 * mismatch on identical values.
 */
function canonical(value) {
    if (value === null || value === undefined) return String(value);
    const s = String(value);
    if (typeof value === 'boolean') return s;
    try {
        return Big(s).stripTrailingZeros().toString();
    } catch (ignored) {
        // NaN, Infinity, or anything else that is not a decimal: compare literally.
        return s;
    }
}

/**
 * Round a canonical decimal to `digits` significant digits, for operations whose
 * result precision legitimately differs between libraries (see the precisionBasis
 * field in operations.js). Comparing at reduced precision still answers the
 * question the preflight exists to answer — are the libraries computing the same
 * quantity — without demanding they agree digit-for-digit at full working
 * precision, which they cannot when their precision bases differ.
 */
function toSignificantDigits(canonicalStr, digits) {
    try {
        return Big(canonicalStr).round(MC(digits, RoundingMode.HALF_UP)).stripTrailingZeros().toString();
    } catch (ignored) {
        return canonicalStr;
    }
}

module.exports = { attachEventsAndRun, canonical, toSignificantDigits };
