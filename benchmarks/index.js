'use strict';
// Runs every operation defined in ./operations.js as its own Benchmark.Suite and
// prints a comparison table.
//
// Things this harness is deliberate about, because a benchmark that is not comparable is
// worse than no benchmark:
//
//  1. Output equivalence is verified BEFORE timing, in a child process, over the whole
//     result stream. A library is not faster if it computed a different answer. See
//     ./verify.js for why it is a child process and why it compares every result.
//
//  2. Rates are reported per operation, not per batch. Each loop body walks the
//     whole operand array, so Benchmark.js's `hz` counts batches/sec. Multiplying by
//     the batch's call count gives a real ops/sec figure. This factor is constant
//     across libraries within a row, so it never changed the rankings — but the
//     absolute numbers were understated by 35-72x.
//
//  3. A winner is declared only for rows that are actually a like-for-like race. If the
//     libraries disagreed on the result, are working to different precision bases, are
//     implementing different semantics, or only one of them implements the operation,
//     the row reports its rates without a trophy. A footnote under a trophy is too easy
//     to read past.
//
//  4. Margins come from the measured error of BOTH rates. Benchmark.js reports a relative
//     margin of error per benchmark; a lead is claimed only when the winner's lower bound
//     clears the runner-up's upper bound.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const Benchmark = require('benchmark');
const { operations, libNames } = require('./operations.js');
const { attachEventsAndRun } = require('./utils.js');

console.log('----------Output-equivalence preflight-------\n');
console.log('Comparing every result each library produces for the same operands,');
console.log('in a separate process so verification cannot warm the caches we are about to time.\n');

const verified = JSON.parse(execFileSync(
    process.execPath,
    [path.join(__dirname, 'verify.js')],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
));
const equivalence = verified.ops;
const EQUIVALENCE_SIG_DIGITS = verified.significantDigits;

console.log(`Operations with a differing precision basis are compared at ${EQUIVALENCE_SIG_DIGITS} significant digits.\n`);

for (const op of operations) {
    const outcome = equivalence[op.name];
    const label = {
        ok: `agree (${outcome.compared} results)`,
        mismatch: 'DISAGREE',
        single: 'only one library — not comparable',
        error: 'ERROR',
    }[outcome.status];
    console.log(`  ${op.name}: ${label}${outcome.detail ? `\n      ${outcome.detail}` : ''}`);
}

const mismatched = Object.entries(equivalence).filter(([, r]) => r.status === 'mismatch');
console.log(mismatched.length === 0
    ? '\nAll comparable operations agree.\n'
    : `\n${mismatched.length} operation(s) disagree; those rows are reported without a winner.\n`);

console.log('----------Starting tests-------\n');

const results = []; // { name, hz: { [lib]: hz }, rme, calls }

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

const usedFootnotes = new Set();

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
    let second = null;
    let bestHz = -Infinity;
    let secondHz = -Infinity;
    const opsPerSec = {};
    for (const lib of libNames) {
        const h = hz[lib];
        if (h === undefined) continue; // library doesn't implement this operation
        const perOp = h * calls;
        opsPerSec[lib] = perOp;
        if (perOp > bestHz) {
            secondHz = bestHz; second = best; best = lib; bestHz = perOp;
        } else if (perOp > secondHz) {
            secondHz = perOp; second = lib;
        }
    }

    // Why this row may not have a winner. Each reason is a disqualification, not a
    // caveat on an otherwise valid result.
    let disqualified = null;
    if (eq.status === 'error') disqualified = ['&sup1;', 'the preflight errored'];
    else if (eq.status === 'mismatch') disqualified = ['&sup2;', 'results disagree'];
    else if (eq.status === 'single') disqualified = ['&sup3;', 'only one library implements it'];
    else if (op.notComparable) disqualified = ['&#8308;', 'different semantics'];
    else if (op.precisionBasis === 'mixed') disqualified = ['&#8309;', 'precision basis differs'];

    const winner = disqualified ? null : best;
    const cells = libNames.map((lib) => {
        const v = opsPerSec[lib];
        if (v === undefined) return ' - ';
        return lib === winner ? `**${fmt(v)}**` : fmt(v);
    });

    let fastest;
    if (disqualified) {
        usedFootnotes.add(disqualified[0]);
        fastest = `not comparable ${disqualified[0]}`;
    } else if (!best) {
        fastest = ' - ';
    } else {
        // Claim a lead only when the winner's interval clears the runner-up's. Benchmark.js's
        // rme is a 95% relative margin of error on the mean, so this is the honest form of
        // what used to be an arbitrary "rme + 5%" fudge.
        let margin = '';
        if (secondHz > 0) {
            const lowerBest = bestHz * (1 - (rme[best] || 0) / 100);
            const upperSecond = secondHz * (1 + (rme[second] || 0) / 100);
            margin = lowerBest > upperSecond
                ? ` (${(bestHz / secondHz).toFixed(1)}x)`
                : ' (within noise)';
        }
        fastest = `🏆 **${best}**${margin}`;
    }

    // A note does not disqualify the row — the race is fair — but the number means
    // something narrower than the column header suggests.
    if (op.note) {
        usedFootnotes.add('&#8310;');
        fastest += ' &#8310;';
    }

    console.log('| ' + name + ' | ' + cells.join(' | ') + ' | ' + fastest + ' |');

    machineReadable.operations.push({
        name,
        callsPerBatch: calls,
        resultsCompared: eq.compared || 0,
        precisionBasis: op.precisionBasis || 'exact',
        cohort: op.cohort || null,
        equivalence: eq.status,
        comparable: !disqualified,
        notComparableReason: disqualified ? disqualified[1] : null,
        note: op.note || null,
        fastest: winner,
        opsPerSec,
        relativeMarginOfErrorPct: rme,
    });
}

const footnotes = [
    ['&sup1;', 'The preflight could not run this operation for every library, so the rates are unverified.'],
    ['&sup2;', 'Libraries did not agree on the result, so the rates are not a like-for-like comparison.'],
    ['&sup3;', 'Only one library implements this operation; there is nothing to compare against.'],
    ['&#8308;', 'The libraries implement different semantics here, so equal rates would not mean equal work.'],
    ['&#8309;', 'Precision basis differs between libraries (significant digits vs decimal places),'
        + ' so they are not doing equal work.'],
    ['&#8310;', operations.filter((o) => o.note).map((o) => `${o.name}: ${o.note}.`).join(' ')],
];
console.log('');
for (const [mark, text] of footnotes) {
    if (usedFootnotes.has(mark)) console.log(`${mark} ${text}`);
}

const outPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outPath, JSON.stringify(machineReadable, null, 2));
console.log(`\nMachine-readable results written to ${path.relative(process.cwd(), outPath)}`);
