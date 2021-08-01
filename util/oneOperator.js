'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const { generateBatches } = require('./util');
const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPromiseSize = 1000; // defines concurrency, repeatCountForRandomTests should divide this number
const maxPrecision = 1000;
const maxPowNumber = 9999; // too big pow is not good for BigInt
const maxRoundingMode = 8;
const maxPoint = 1000;
const minPoint = -1000;
const maxScale = 2147483647;
const minScale = 2147483648;
const numberOfToStringTests = 2000;

let counter = 0; // to check progress
const numberSet = new Set();

async function runJava(name, args) {
    try {
        const classPath = path.join(__dirname, 'com', name);

        let command = `java -cp ${classPath} Main`;
        for (const arg of args) {
            command += ` ${arg}`;
        }
        const { stdout, stderr } = await exec(command);
        if (stderr !== '') {
            return 'errorThrown';
        }
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function generateTest(name, args, testCasesArray) {
    const result = await runJava(name, args);
    testCasesArray.push({ args: args, result: result });
    counter++;
    if (counter % maxPromiseSize === 0) console.log(counter);
}

const noParamTests = [
    'Negate',
];

const testCaseMethods = {
    Abs: number => [
        number,
        Math.floor(Math.random() * maxPrecision), // precision
        Math.floor(Math.random() * maxRoundingMode) // rounding mode
    ],
    MovePointLeft: number => [
        number,
        Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint) // point
    ],
    MovePointRight: number => [
        number,
        Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint) // point
    ],
    Negate: number => [
        number,
        Math.floor(Math.random() * maxPrecision), // precision
        Math.floor(Math.random() * maxRoundingMode) // rounding mode
    ],
    Plus: number => [
        number,
        Math.floor(Math.random() * maxPrecision), // precision
        Math.floor(Math.random() * maxRoundingMode) // rounding mode
    ],
    NumberValue: number => number,
    Pow: number => [
        number,
        Math.floor(Math.random() * 2 * maxPowNumber) - maxPowNumber, // pow between [-maxPowNumber, maxPowNumber)
        Math.floor(Math.random() * maxPrecision), // precision
        Math.floor(Math.random() * maxRoundingMode) // rounding mode
    ]
};

async function generateJsonFile(name, outputDir) {
    const testCases = [];
    const parametrizedTest = !noParamTests.includes(name);
    const fileName = path.join(outputDir, `${name[0].toLowerCase()}${name.slice(1)}TestCases.json`);

    if (fs.existsSync(fileName)) {
        console.log(`${fileName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${fileName}..`);

        let numberOfTestsCases = numberSet.length;
        if (parametrizedTest) {
            numberOfTestsCases *= repeatCountForRandomTests;
        }
        console.log(`Number of test cases are ${numberOfTestsCases}`);

        const testArgs = new Array(numberOfTestsCases);

        let i = 0;
        for (const number of numberSet) {
            for (let j = 0; j < parametrizedTest ? repeatCountForRandomTests : 1; j++) {
                testArgs[i] = testCaseMethods[name](number);
                i++;
            }
        }

        const batches = generateBatches(testArgs, maxPromiseSize);

        for (const batch of batches) {
            let indexCounter = 0;
            const jobs = new Array(batch.length);
            for (const args of batch) {
                jobs[indexCounter] = generateTest(name, args, testCases);
                indexCounter++;
            }
            await Promise.all(jobs);
        }
        fs.writeFileSync(fileName, JSON.stringify(testCases));
    }
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

async function runToStringJava(bigint, scale, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/ToString Main ${bigint} ${scale} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
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
        if (counter % maxPromiseSize === 0) console.log(counter);
    }
}

async function generateToStringFile(outputDir) {
    const toStringOutputName = path.join(outputDir, 'toStringTestCases.json');
    const toStringTestCases = [];

    if (fs.existsSync(toStringOutputName)) {
        console.log(`${toStringOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${toStringOutputName}..`);
        console.log(`Number of test cases are ${numberOfToStringTests * repeatCountForRandomTests}`);
        const jobs = new Array(numberOfToStringTests);
        for (let i = 0; i < numberOfToStringTests; i++) {
            const randomBigInt = generateRandomBigInt();
            jobs[i] = generateToStringTest(randomBigInt.toString(), toStringTestCases);
        }

        await Promise.all(jobs);
        fs.writeFileSync(toStringOutputName, JSON.stringify(toStringTestCases));
    }
}

async function run(outputDir) {

    await generateToStringFile(outputDir);

    for (const tuple of testNumbers) {
        numberSet.add(tuple[0].toString());
        numberSet.add(tuple[1].toString());
    }

    for (const name in testCaseMethods) {
        await generateJsonFile(name, outputDir);
        counter = 0;
    }
}

module.exports = run;
