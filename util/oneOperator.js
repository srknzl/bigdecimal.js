'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const maxPowNumber = 9999; // too big pow is not good for BigInt
const maxRoundingMode = 8;
const maxPoint = 1000;
const minPoint = -1000;
const maxScale = 2147483647;
const minScale = 2147483648;
const numberOfToStringTests = 2000;

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

async function runPlusJava(number, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Plus Main ${number} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runPowJava(number, pow, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Pow Main ${number} ${pow} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runToStringJava(bigint, scale, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/ToString Main ${bigint} ${scale} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function runNumberValueJava(number) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/NumberValue Main ${number}`);
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

async function generatePlusTest(number, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runPlusJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generatePowTest(number, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            number,
            Math.floor(Math.random() * 2 * maxPowNumber) - maxPowNumber, // pow between [-maxPowNumber, maxPowNumber)
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runPowJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateToStringTest(bigint, testCasesArray) {
    for (let i = 0; i < repeatCountForRandomTests; i++) {
        const args = [
            bigint,
            Math.floor(Math.random() * maxScale) - minScale, // scale between [-2147483648, 2147483647)
            Math.floor(Math.random() * maxPrecision), // precision
            Math.floor(Math.random() * maxRoundingMode) // rounding mode
        ];
        const result = await runToStringJava(...args);
        testCasesArray.push({
            args: args,
            result: result
        });
        counter++;
        if (counter % 100 === 0) console.log(counter);
    }
}

async function generateNumberValueTest(number, testCasesArray) {
    const args = [
        number
    ];
    const result = await runNumberValueJava(...args);
    testCasesArray.push({
        args: args,
        result: result
    });
    counter++;
    if (counter % 100 === 0) console.log(counter);
}

function generateRandomBigInt() {
    const opCount = Math.floor(Math.random() * 10) + 1; // do [1, 10] operations

    let result = 1n;

    for (let i = 0; i < opCount; i++) {
        const randomBigInt = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        result *= randomBigInt;
    }
    return result;

}

async function run(outputDir) {
    const absOutputName = path.join(outputDir, 'absTestCases.json');
    const movePointLeftOutputName = path.join(outputDir, 'movePointLeftTestCases.json');
    const movePointRightOutputName = path.join(outputDir, 'movePointRightTestCases.json');
    const negateOutputName = path.join(outputDir, 'negateTestCases.json');
    const plusOutputName = path.join(outputDir, 'plusTestCases.json');
    const numberValueOutputName = path.join(outputDir, 'numberValueTestCases.json');
    const powOutputName = path.join(outputDir, 'powTestCases.json');
    const toStringOutputName = path.join(outputDir, 'toStringTestCases.json');

    const absTestCases = [];
    const movePointLeftTestCases = [];
    const movePointRightTestCases = [];
    const negateTestCases = [];
    const plusTestCases = [];
    const numberValueTestCases = [];
    const powTestCases = [];
    const toStringTestCases = [];

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

    if (fs.existsSync(plusOutputName)) {
        console.log(`${plusOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${plusOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].map(number => generatePlusTest(number, plusTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(plusOutputName, JSON.stringify(plusTestCases));
    }

    if (fs.existsSync(powOutputName)) {
        console.log(`${powOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${powOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].map(number => generatePowTest(number, powTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(powOutputName, JSON.stringify(powTestCases));
    }

    if (fs.existsSync(toStringOutputName)) {
        console.log(`${toStringOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${toStringOutputName}..`);
        console.log(`Number of test cases are ${numberOfToStringTests}`);
        const jobs = new Array(numberOfToStringTests);
        for (let i = 0; i < numberOfToStringTests; i++) {
            const randomBigInt = generateRandomBigInt();
            jobs[i] = generateToStringTest(randomBigInt.toString(), toStringTestCases);
        }

        await Promise.all(jobs);
        fs.writeFileSync(toStringOutputName, JSON.stringify(toStringTestCases));
    }

    if (fs.existsSync(numberValueOutputName)) {
        console.log(`${numberValueOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${numberValueOutputName}..`);
        console.log(`Number of test cases are ${testNumbers.length}`);
        const jobs = [...numberSet].map(number => generateNumberValueTest(number, numberValueTestCases));
        await Promise.all(jobs);
        fs.writeFileSync(numberValueOutputName, JSON.stringify(numberValueTestCases));
    }
}

module.exports = run;
