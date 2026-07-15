'use strict';
// Runs every operation defined in ./operations.js as its own Benchmark.Suite and
// prints a comparison table. The winner of each row is bolded and named in the
// "Fastest" column, with how many times faster it is than the runner-up.
const Benchmark = require('benchmark');
const { operations, libNames } = require('./operations.js');
const { attachEventsAndRun } = require('./utils.js');

console.log('----------Starting tests-------\n');

const results = []; // { name, hz: { [lib]: hz } }

for (const op of operations) {
    if (op.setup) op.setup();
    const suite = new Benchmark.Suite(op.name);
    for (const lib of libNames) {
        if (op.libs[lib]) suite.add(lib, op.libs[lib]);
    }
    attachEventsAndRun(suite);
    const hz = {};
    suite.forEach((bench) => {
        hz[bench.name] = bench.hz;
    });
    results.push({ name: op.name, hz });
}

const fmt = (n) => Math.round(n).toLocaleString('en-US');

console.log('\nBenchmark report:\n');
console.log('| Operation | ' + libNames.join(' | ') + ' | Fastest |');
console.log('| --- | ' + libNames.map(() => '---').join(' | ') + ' | --- |');

for (const { name, hz } of results) {
    let best = null;
    let bestHz = -Infinity;
    let secondHz = -Infinity;
    for (const lib of libNames) {
        const h = hz[lib];
        if (h === undefined) continue; // library doesn't implement this operation
        if (h > bestHz) {
            secondHz = bestHz; best = lib; bestHz = h;
        } else if (h > secondHz) {
            secondHz = h;
        }
    }
    const cells = libNames.map((lib) => {
        const h = hz[lib];
        if (h === undefined) return ' - ';
        return lib === best ? `**${fmt(h)}**` : fmt(h);
    });
    const margin = secondHz > 0 ? ` (${(bestHz / secondHz).toFixed(1)}×)` : '';
    const fastest = best ? `🏆 **${best}**${margin}` : ' - ';
    console.log('| ' + name + ' | ' + cells.join(' | ') + ' | ' + fastest + ' |');
}
