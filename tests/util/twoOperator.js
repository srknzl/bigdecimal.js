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

let counter = 0;

async function runAddJava(first, second, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Add Main ${first} ${second} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runSubtractJava(first, second, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Subtract Main ${first} ${second} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runMultiplyJava(first, second, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Multiply Main ${first} ${second} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runDivideJava(first, second, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Divide Main ${first} ${second} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runDivideAndRemainderJava(first, second, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(
            `java -cp com/DivideAndRemainder Main ${first} ${second} ${precision} ${roundingMode}`
        );
        if (stderr !== '') return 'errorThrown';
        return stdout.trim().split(' '); // the first is quotient, the second is remainder
    } catch (e) {
        return ['errorThrown', 'errorThrown'];
    }
}

async function runCompareToJava(first, second) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/CompareTo Main ${first} ${second}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function generateAddTest(tuple, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runAddJava(...args);
        testCasesArray.push({
            args: args,
            result: result.trim()
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateSubtractTest(tuple, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runSubtractJava(...args);
        testCasesArray.push({
            args: args,
            result: result.trim()
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateMultiplyTest(tuple, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runMultiplyJava(...args);
        testCasesArray.push({
            args: args,
            result: result.trim()
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateDivideTest(tuple, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runDivideJava(...args);
        testCasesArray.push({
            args: args,
            result: result.trim()
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateDivideAndRemainderTest(tuple, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runDivideAndRemainderJava(...args);
        if (result[0] === 'errorThrown') {
            testCasesArray.push({
                args: args,
                quotient: 'errorThrown',
                remainder: 'errorThrown'
            });
        } else {
            testCasesArray.push({
                args: args,
                quotient: result[0],
                remainder: result[1]
            });
        }
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateCompareToTest(tuple, testCasesArray) {
    const args = [
        tuple[0],
        tuple[1]
    ];
    const result = await runCompareToJava(...args);
    testCasesArray.push({
        args: args,
        result: result.trim()
    });
    counter++;
    if (counter % 100 === 0) console.log(counter);
}

async function run() {
    const additionOutputName = path.join(outputDir, 'additionTestCases.json');
    const subtractionOutputName = path.join(outputDir, 'subtractionTestCases.json');
    const multiplicationOutputName = path.join(outputDir, 'multiplicationTestCases.json');
    const divisionOutputName = path.join(outputDir, 'divisionTestCases.json');
    const compareToOutputName = path.join(outputDir, 'compareToTestCases.json');
    const divideAndRemainderOutputName = path.join(outputDir, 'divideAndRemainderTestCases.json');

    const addTestCases = [];
    const subtractTestCases = [];
    const multiplyTestCases = [];
    const divideTestCases = [];
    const compareToTestCases = [];
    const divideAndRemainderTestCases = [];

    if (fs.existsSync(additionOutputName)) {
        console.log(`${additionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${additionOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateAddTest(tuple, addTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(additionOutputName, JSON.stringify(addTestCases));
    }

    if (fs.existsSync(subtractionOutputName)) {
        console.log(`${subtractionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${subtractionOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateSubtractTest(tuple, subtractTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(subtractionOutputName, JSON.stringify(subtractTestCases));
    }

    if (fs.existsSync(multiplicationOutputName)) {
        console.log(`${multiplicationOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${multiplicationOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateMultiplyTest(tuple, multiplyTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(multiplicationOutputName, JSON.stringify(multiplyTestCases));
    }

    if (fs.existsSync(divisionOutputName)) {
        console.log(`${divisionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${divisionOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateDivideTest(tuple, divideTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(divisionOutputName, JSON.stringify(divideTestCases));
    }

    if (fs.existsSync(divideAndRemainderOutputName)) {
        console.log(`${divideAndRemainderOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${divideAndRemainderOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateDivideAndRemainderTest(tuple, divideAndRemainderTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(divideAndRemainderOutputName, JSON.stringify(divideAndRemainderTestCases));
    }

    if (fs.existsSync(compareToOutputName)) {
        console.log(`${compareToOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${compareToOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = testNumbers.map(tuple => generateCompareToTest(tuple, compareToTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(compareToOutputName, JSON.stringify(compareToTestCases));
    }

}

module.exports = run;
