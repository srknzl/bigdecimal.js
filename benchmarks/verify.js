'use strict';
// Output-equivalence preflight. Run as a SEPARATE PROCESS by index.js, which reads the
// JSON this writes to stdout.
//
// Two things about it are deliberate.
//
// Separate process, because verifying is destructive to the measurement it precedes.
// Canonicalising a result calls toString() on it, and bigdecimal.js caches both the
// string form and the precision lazily on the instance. Verifying in-process warms those
// caches on the very operand arrays the suite is about to time, so the ToString and
// Precision-dependent rows would be measured against a warm cache that no real caller
// starts with. A child process throws that state away.
//
// Full stream, because comparing one value is not verification. The loop helpers return
// the last result of the batch, and the preflight used to compare only that — one sample
// out of 36. A library that disagreed on any other operand passed silently. Every result
// is compared now, and the first disagreement is reported with the operand index.
const {
    operations, libNames, setCollecting, getBatchResults, getLastBatchCalls,
} = require('./operations.js');
const { canonical, toSignificantDigits } = require('./utils.js');

// Operations whose result precision legitimately differs between libraries are compared
// at reduced significant digits. This applies to 'mixed' rows ONLY — those are the ones
// where the libraries are being asked for different quantities of result and cannot agree
// digit-for-digit. The split Divide rows ask every library for the same quantity, so they
// are held to exact agreement like everything else.
const SIG_DIGITS = 12;

const trunc = (s) => (s.length > 40 ? s.slice(0, 40) + '…' : s);

setCollecting(true);

const ops = {};
for (const op of operations) {
    if (op.setup) op.setup();

    let outcome;
    try {
        const perLib = {};
        let calls = 0;
        for (const lib of libNames) {
            if (!op.libs[lib]) continue;
            op.libs[lib]();
            calls = getLastBatchCalls();
            let values = getBatchResults().map(canonical);
            if (op.precisionBasis === 'mixed') {
                values = values.map((v) => toSignificantDigits(v, SIG_DIGITS));
            }
            perLib[lib] = values;
        }

        const entries = Object.entries(perLib);
        if (entries.length < 2) {
            outcome = { status: 'single', calls, detail: '' };
        } else {
            const [refLib, ref] = entries[0];
            let detail = '';
            for (const [lib, values] of entries.slice(1)) {
                const n = Math.max(ref.length, values.length);
                for (let i = 0; i < n; i++) {
                    if (ref[i] !== values[i]) {
                        detail = `operand ${i}: ${refLib}=${trunc(String(ref[i]))}`
                            + ` vs ${lib}=${trunc(String(values[i]))}`;
                        break;
                    }
                }
                if (detail) break;
            }
            outcome = { status: detail ? 'mismatch' : 'ok', calls, detail, compared: ref.length };
        }
    } catch (e) {
        outcome = { status: 'error', calls: 0, detail: e.message };
    }
    ops[op.name] = outcome;
}

process.stdout.write(JSON.stringify({ significantDigits: SIG_DIGITS, ops }));
