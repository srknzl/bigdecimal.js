'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const maxRoundingMode = 8;
const maxPoint = 1000;
const minPoint = -1000;

const outputDir = path.join(__dirname, 'output');

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

async function runMovePointRightJava(number, point) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/MovePointRight Main ${number} ${point}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runMovePointLeftJava(number, point) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/MovePointLeft Main ${number} ${point}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runNegateJava(number, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Negate Main ${number} ${precision} ${roundingMode}`);
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
            args: args,
            result: absResult.trim()
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateMovePointLeftTest(number, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint) // point
        ];
        const result = await runMovePointLeftJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateMovePointRightTest(number, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint) // point
        ];
        const result = await runMovePointRightJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateNegateTest(number, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runNegateJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function run() {
    const absOutputName = path.join(outputDir, 'absTestCases.json');
    const movePointLeftOutputName = path.join(outputDir, 'movePointLeftTestCases.json');
    const movePointRightOutputName = path.join(outputDir, 'movePointRightTestCases.json');
    const negateOutputName = path.join(outputDir, 'negateTestCases.json');

    const absTestCases = [];
    const movePointLeftTestCases = [];
    const movePointRightTestCases = [];
    const negateTestCases = [];

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
        const jobs = [...numberSet].map(number => generateAbsTest(number, absTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(absOutputName, JSON.stringify(absTestCases));
    }

    if (fs.existsSync(movePointLeftOutputName)) {
        console.log(`${movePointLeftOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${movePointLeftOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].slice(1, 100).map(number => generateMovePointLeftTest(number, movePointLeftTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(movePointLeftOutputName, JSON.stringify(movePointLeftTestCases));
    }

    if (fs.existsSync(movePointRightOutputName)) {
        console.log(`${movePointRightOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${movePointRightOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].map(number => generateMovePointRightTest(number, movePointRightTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(movePointRightOutputName, JSON.stringify(movePointRightTestCases));
    }

    if (fs.existsSync(negateOutputName)) {
        console.log(`${negateOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${negateOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].map(number => generateNegateTest(number, negateTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(negateOutputName, JSON.stringify(negateTestCases));
    }
}

module.exports = run;
