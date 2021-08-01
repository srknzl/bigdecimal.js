'use strict';
// Run this script to generate all test cases in output directory
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const maxRoundingMode = 8;
const maxPromiseSize = 1000; // defines concurrency, repeatCountForRandomTests should divide this number
const maxPowNumber = 9999; // too big pow is not good for BigInt
const maxPoint = 1000;
const minPoint = -1000;
const maxScale = 2147483647;
const minScale = 2147483648;
const numberOfToStringTests = 2000;

const numberSet = new Set();
let counter = 0;

/**
 * Returns errorThrown string
 * @param twoResult Whether two result should be returned;
 */
function getErrorResult(twoResult) {
    if (twoResult) {
        return ['errorThrown', 'errorThrown'];
    } else {
        return 'errorThrown';
    }
}

/**
 * Run java to calculate correct result
 *
 * @param name name of the test
 * @param args [first decimal string, second decimal string, precision, rounding mode] where the last two elements are optional
 * @param twoResult Whether two result should be returned
 * @return the execution result
 */
async function runJava(name, args, twoResult) {
    try {
        const classPath = path.join(__dirname, 'com', name);

        let command = `java -cp ${classPath} Main ${args[0]} ${args[1]}`;
        if (args.length > 2) {
            command += ` ${args[2]} ${args[3]}`;
        }
        const { stdout, stderr } = await exec(command);
        if (stderr !== '') {
            return getErrorResult(twoResult);
        }
        if (twoResult) {
            return stdout.trim().split(' ');
        } else {
            return stdout.trim();
        }
    } catch (e) {
        return getErrorResult(twoResult);
    }
}

/**
 * Generate test cases and append them to to the testCasesArray
 *
 * @param name Name of the test
 * @param args Test args
 * @param testCasesArray The results will be appended to this one
 * @param twoResult Whether two result should be generated
 */
async function generateTest(name, args, testCasesArray, twoResult) {
    const result = await runJava(name, args, twoResult);
    testCasesArray.push({ args: args, result: result });
    counter++;
    if (counter % maxPromiseSize === 0) console.log(counter);
}

/**
 * Generates json file of test `name`
 * @param name Test name
 * @param randomize if it will generate several tests due to random input
 * @param outputDir output directory
 * @param twoResult does the operation generate two numbers
 * @param testNumbers test number set
 */
async function generateJsonFile(name, randomize, outputDir, twoResult, testNumbers) {
    const testCases = [];
    const fileName = path.join(outputDir, `${name[0].toLowerCase()}${name.slice(1)}TestCases.json`);

    if (fs.existsSync(fileName)) {
        console.log(`${fileName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${fileName}..`);

        let testArgs;

        if (name === 'ToString') {
            const numberOfTestCases = numberOfToStringTests * repeatCountForRandomTests;

            console.log(`Number of test cases are ${numberOfTestCases}`);
            testArgs = new Array(numberOfTestCases);
            let i = 0;
            for (let j = 0; j < numberOfTestCases; j++) {
                const randomBigInt = generateRandomBigInt();
                testArgs[i] = testCaseMethods[name].argsFn(randomBigInt.toString());
                i++;
            }

        } else {
            let numberOfTestsCases = Array.isArray(testNumbers) ? testNumbers.length : testNumbers.size;
            if (randomize) {
                numberOfTestsCases *= repeatCountForRandomTests;
            }
            console.log(`Number of test cases are ${numberOfTestsCases}`);
            testArgs = new Array(numberOfTestsCases);

            let i = 0;
            for (const testNumber of testNumbers) {
                for (let j = 0; j < (randomize ? repeatCountForRandomTests : 1); j++) {
                    testArgs[i] = testCaseMethods[name].argsFn(testNumber);
                    i++;
                }
            }
        }
        const batches = generateBatches(testArgs, maxPromiseSize);

        for (const batch of batches) {
            let indexCounter = 0;
            const jobs = new Array(batch.length);
            for (const args of batch) {
                jobs[indexCounter] = generateTest(name, args, testCases, twoResult);
                indexCounter++;
            }
            await Promise.all(jobs);
        }

        fs.writeFileSync(fileName, JSON.stringify(testCases));
    }
}

const testCaseMethods = {
    Abs: {
        argsFn: (first) => [first, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    MovePointLeft: {
        argsFn: (first) => [first, Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    MovePointRight: {
        argsFn: (first) => [first, Math.floor(Math.random() * (maxPoint - minPoint + 1) + minPoint)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Negate: {
        argsFn: (first) => [first, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Plus: {
        argsFn: (first) => [first, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    NumberValue: {
        argsFn: (first) => [first],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    Pow: {
        argsFn: (first) => [
            first,
            Math.floor(Math.random() * 2 * maxPowNumber) - maxPowNumber,
            Math.floor(Math.random() * maxPrecision),
            Math.floor(Math.random() * maxRoundingMode)
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Add: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Subtract: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Multiply: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Divide: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    DivideToIntegralValue: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Remainder: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    DivideAndRemainder: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxPrecision), Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: true,
        randomize: true
    },
    CompareTo: {
        argsFn: ([f, s]) => [f, s],
        twoOp: true,
        twoResult: false,
        randomize: false
    },
    Equals: {
        argsFn: ([f, s]) => [f, s],
        twoOp: true,
        twoResult: false,
        randomize: false
    },
    Max: {
        argsFn: ([f, s]) => [f, s],
        twoOp: true,
        twoResult: false,
        randomize: false
    },
    Min: {
        argsFn: ([f, s]) => [f, s],
        twoOp: true,
        twoResult: false,
        randomize: false
    },
    ToString: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * maxScale) - minScale,
            Math.floor(Math.random() * maxPrecision),
            Math.floor(Math.random() * maxRoundingMode),
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Round: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * maxPrecision),
            Math.floor(Math.random() * maxRoundingMode),
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    ScaleByPowerOfTen: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * maxScale) - minScale
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    SetScale: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * maxScale) - minScale,
            Math.floor(Math.random() * maxRoundingMode),
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Signum: {
        argsFn: (f) => [
            f
        ],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    Sqrt: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * maxPrecision),
            Math.floor(Math.random() * maxRoundingMode),
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    StripTrailingZeros: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ToBigInt: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ToBigIntExact: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ToEngineeringString: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ToPlainString: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    Ulp: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    UnscaledValue: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    Scale: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
};

/**
 * Generates random bigint
 */
function generateRandomBigInt() {
    const opCount = Math.floor(Math.random() * 10) + 1; // do [1, 10] operations

    let result = 1n;

    for (let i = 0; i < opCount; i++) {
        const randomBigInt = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        result *= randomBigInt;
    }
    return result;
}

/**
 * Generates batches for better parallel execution
 */
function generateBatches(testArgs, maxPromiseSize) {
    const batches = new Array(Math.ceil(testArgs.length / maxPromiseSize));

    for (let testCounter = 0, batchCounter = 0; testCounter < testArgs.length; batchCounter++) {
        const jobs = new Array(Math.min(1000, testArgs.length - testCounter)); // at most 1000 sized array
        for (let j = 0; j < jobs.length; j++, testCounter++) {
            jobs[j] = testArgs[testCounter];
        }
        batches[batchCounter] = jobs;
    }

    return batches;
};

async function run() {

    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    for (const tuple of testNumbers) {
        numberSet.add(tuple[0].toString());
        numberSet.add(tuple[1].toString());
    }

    for (const name in testCaseMethods) {
        await generateJsonFile(
            name,
            testCaseMethods[name].randomize,
            outputDir,
            testCaseMethods[name].twoResult,
            testCaseMethods[name].twoOp ? testNumbers : numberSet
        );
        counter = 0;
    }
}

run().catch(console.error);
