'use strict';
console.log('----------Starting tests-------');

const suites = [
    require('./suites/constructor'),
    require('./suites/add.js'),
    require('./suites/subtract.js'),
    require('./suites/mul.js'),
    require('./suites/divide.js'),
    require('./suites/remainder.js'),
    require('./suites/positive_pow.js'),
    require('./suites/negative_pow.js'),
    require('./suites/abs.js'),
    require('./suites/integer_round.js'),
    require('./suites/decimal_scaling.js'),
    require('./suites/compare.js')
];

// Retrieve all unique names in the test suites
const allTestNames = Array.from(suites.reduce((r, n) => {
    n.map('name').forEach(n => r.add(n));
    return r;
}, new Set()));

console.log('Benchmark report:\n');

// print report header
console.log('| Operation | ' + allTestNames.join(' | ') + ' |');
console.log('| --- | '+ allTestNames.map(() => '---').join(' | ') + ' |');

suites.forEach(suite => {
    const libTest = suite.filter(v => v.name === 'Bigdecimal.js')[0];
    const cells = allTestNames.map(name => {
        const test = suite.filter(t => t.name === name)[0];
        if (!test) return ' - ';
        const pct = Math.round((test.hz / libTest.hz - 1) * 100);
        const pctWithColor = test === libTest
            ? ' - '
            : pct >= 0
                ? `<span style="color:green">**${pct}%**</span>`
                : `<span style="color:red">${pct}%</span>`;
        return `${Math.round(test.hz).toLocaleString('en-US')} (${pctWithColor})`;
    });
    // print report row
    console.log('| ' + suite.name + ' | ' + cells.join(' | ') + ' |');
});
