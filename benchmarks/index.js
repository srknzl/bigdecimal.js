'use strict';
// Runs every operation defined in ./operations.js as its own Benchmark.Suite and
// prints a comparison table.
//
// Two things this harness is deliberate about, because a benchmark that is not
// comparable is worse than no benchmark:
//
//  1. Output equivalence is verified BEFORE timing. A library is not faster if it
//     computed a different answer. Every library's result for an operation is
//     canonicalised and compared; disagreements are reported and the row is marked,
//     rather than being silently presented as a win.
//
//  2. Rates are reported per operation, not per batch. Each loop body walks the
//     whole operand array, so Benchmark.js's `hz` counts batches/sec. Multiplying by
//     the batch's call count gives a real ops/sec figure. This factor is constant
//     across libraries within a row, so it never changed the rankings — but the
//     absolute numbers were understated by 35-72x.
const fs = require('fs');
const path = require('path');
const Benchmark = require('benchmark');
const { operations, libNames, getLastBatchCalls } = require('./operations.js');
const { attachEventsAndRun, canonical, toSignificantDigits } = require('./utils.js');

// Operations whose results legitimately differ in precision between libraries are
// compared at reduced significant digits; see operations.js for why the bases differ.
const EQUIVALENCE_SIG_DIGITS = 12;

/**
 * Run each library's loop body once and compare canonicalised results.
 * Returns { status, calls, detail } where status is 'ok', 'mismatch' or 'single'.
 */
function verifyEquivalence(op) {
    const results = {};
    let calls = 0;
    for (const lib of libNames) {
        if (!op.libs[lib]) continue;
        const value = op.libs[lib]();
        calls = getLastBatchCalls();
        let c = canonical(value);
        if (op.precisionBasis && op.precisionBasis !== 'exact') {
            c = toSignificantDigits(c, EQUIVALENCE_SIG_DIGITS);
        }
        results[lib] = c;
    }
    const entries = Object.entries(results);
    if (entries.length < 2) return { status: 'single', calls, detail: '' };

    const [, reference] = entries[0];
    const disagreeing = entries.filter(([, v]) => v !== reference);
    if (disagreeing.length === 0) return { status: 'ok', calls, detail: '' };
    return {
        status: 'mismatch',
        calls,
        detail: entries.map(([lib, v]) => `${lib}=${v.length > 40 ? v.slice(0, 40) + '…' : v}`).join(' | '),
    };
}

console.log('----------Output-equivalence preflight-------\n');
console.log('Comparing each library\'s result for the same operands.');
console.log(`Operations with a differing precision basis are compared at ${EQUIVALENCE_SIG_DIGITS} significant digits.\n`);

const equivalence = {};
for (const op of operations) {
    if (op.setup) op.setup();
    let outcome;
    try {
        outcome = verifyEquivalence(op);
    } catch (e) {
        outcome = { status: 'error', calls: 0, detail: e.message };
    }
    equivalence[op.name] = outcome;
    const label = {
        ok: 'agree',
        mismatch: 'DISAGREE',
        single: 'only one library — not comparable',
        error: 'ERROR',
    }[outcome.status];
    console.log(`  ${op.name}: ${label}${outcome.detail ? `\n      ${outcome.detail}` : ''}`);
}

const mismatched = Object.entries(equivalence).filter(([, r]) => r.status === 'mismatch');
console.log(mismatched.length === 0
    ? '\nAll comparable operations agree.\n'
    : `\n${mismatched.length} operation(s) disagree; those rows are marked in the report.\n`);

console.log('----------Starting tests-------\n');

const results = []; // { name, hz: { [lib]: hz }, calls }

for (const op of operations) {
    if (op.setup) op.setup();
    const suite = new Benchmark.Suite(op.name);
    for (const lib of libNames) {
        if (op.libs[lib]) suite.add(lib, op.libs[lib]);
    }
    attachEventsAndRun(suite);
    const hz = {};
    const rme = {};
    suite.forEach((bench) => {
        hz[bench.name] = bench.hz;
        rme[bench.name] = bench.stats.rme; // relative margin of error, %
    });
    results.push({ name: op.name, hz, rme, calls: equivalence[op.name].calls || 1 });
}

const fmt = (n) => Math.round(n).toLocaleString('en-US');

console.log('\nBenchmark report:\n');
console.log('Rates are operations per second (Benchmark.js batch rate x calls per batch).\n');

// The main table holds the blended-operand rows; cohort rows get their own table
// below so the representation split is legible instead of doubling the main one.
const isCohort = (name) => (operations.find((o) => o.name === name) || {}).cohort;
let cohortHeaderPrinted = false;

const printHeader = () => {
    console.log('| Operation | ' + libNames.join(' | ') + ' | Fastest |');
    console.log('| --- | ' + libNames.map(() => '---').join(' | ') + ' | --- |');
};
printHeader();

const machineReadable = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    unit: 'operations per second',
    equivalenceSignificantDigits: EQUIVALENCE_SIG_DIGITS,
    operations: [],
};

for (const { name, hz, rme, calls } of results) {
    const op = operations.find((o) => o.name === name);
    const eq = equivalence[name];

    if (isCohort(name) && !cohortHeaderPrinted) {
        cohortHeaderPrinted = true;
        console.log('');
        console.log('Representation cohorts — the same operations split by whether the operands stay on');
        console.log('bigdecimal.js\'s compact (<= 15-digit) path or force the inflated bigint path.');
        console.log('The blended rows above are dominated by the slower inflated operands.\n');
        printHeader();
    }

    let best = null;
    let bestHz = -Infinity;
    let secondHz = -Infinity;
    const opsPerSec = {};
    for (const lib of libNames) {
        const h = hz[lib];
        if (h === undefined) continue; // library doesn't implement this operation
        const perOp = h * calls;
        opsPerSec[lib] = perOp;
        if (perOp > bestHz) {
            secondHz = bestHz; best = lib; bestHz = perOp;
        } else if (perOp > secondHz) {
            secondHz = perOp;
        }
    }
    const cells = libNames.map((lib) => {
        const v = opsPerSec[lib];
        if (v === undefined) return ' - ';
        return lib === best ? `**${fmt(v)}**` : fmt(v);
    });

    // Only claim a margin when the two rates are separated by more than their
    // combined measurement error; otherwise it is a tie, not a win.
    let margin = '';
    if (secondHz > 0) {
        const ratio = bestHz / secondHz;
        const bestRme = rme[best] || 0;
        const spread = (bestRme + 5) / 100; // best's error plus a conservative allowance
        margin = ratio - 1 > spread ? ` (${ratio.toFixed(1)}x)` : ' (within noise)';
    }

    const marks = [];
    if (eq.status === 'mismatch') marks.push('&sup1;'); // results disagree
    if (op.precisionBasis === 'mixed') marks.push('&sup2;'); // precision basis differs
    const suffix = marks.length ? ' ' + marks.join('') : '';

    const fastest = best ? `🏆 **${best}**${margin}${suffix}` : ' - ';
    console.log('| ' + name + ' | ' + cells.join(' | ') + ' | ' + fastest + ' |');

    machineReadable.operations.push({
        name,
        callsPerBatch: calls,
        precisionBasis: op.precisionBasis || 'exact',
        cohort: op.cohort || null,
        equivalence: eq.status,
        fastest: best,
        opsPerSec,
        relativeMarginOfErrorPct: rme,
    });
}

console.log('');
if (Object.values(equivalence).some((e) => e.status === 'mismatch')) {
    console.log('&sup1; Libraries did not agree on the result for this operation; the rate is not a like-for-like comparison.');
}
if (operations.some((o) => o.precisionBasis === 'mixed')) {
    console.log('&sup2; Precision basis differs between libraries for this operation');
    console.log('   (significant digits vs decimal places), so they are not doing equal work.');
}

const outPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outPath, JSON.stringify(machineReadable, null, 2));
console.log(`\nMachine-readable results written to ${path.relative(process.cwd(), outPath)}`);
