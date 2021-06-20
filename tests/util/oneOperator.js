'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const maxRoundingMode = 8;
const outputDir = path.join('.', 'output');

let counter = 0; // to check progress

async function runAbsJava(number, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Abs Main ${number} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function generateAbsTest(number, absTestCases) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const absResult = await runAbsJava(...args);
        absTestCases.push({
            arguments: args,
            result: absResult.trim()
        });
        counter++;
        if(counter % 100 === 0) console.log(counter);
    }
}

async function run() {
    const absOutputName = path.join(outputDir, 'absTestCases.json');

    const absTestCases = [];

    const numberSet = new Set(); // Get unique set of numbers

    for (const tuple of testNumbers) {
        numberSet.add(tuple[0].toString());
        numberSet.add(tuple[1].toString());
    }

    if (fs.existsSync(absOutputName)) {
        console.log(`${absOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${absOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateAbsTest(tuple, absTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(absOutputName, JSON.stringify(absTestCases));
    }
}

module.exports = run;
