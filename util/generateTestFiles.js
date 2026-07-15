'use strict';
// Run this script to generate all test cases in output directory
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const smallScale = 1000;
const maxRoundingMode = 8;
const maxPowNumber = 9999; // too big pow is not good for BigInt
const maxPoint = 1000;
const minPoint = -1000;
const maxScale = 2147483647;
const minScale = 2147483648;
const numberOfToStringTests = 2000;

const numberSet = new Set();

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
        // One JVM per operation: stream every case through stdin (one
        // space-separated arg list per line) and read one result line per case.
        // This replaces the old one-JVM-per-case model (~549k JVM startups).
        const input = testArgs.map((args) => args.join(' ')).join('\n') + '\n';
        const classPath = path.join(__dirname, 'batch');
        const res = spawnSync('java', ['-cp', classPath, 'Main', name], {
            input,
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 1024, // 1 GB — pow output alone is ~19 MB
        });
        if (res.status !== 0) {
            throw new Error(`java exited ${res.status} for ${name}: ${res.stderr}`);
        }
        const lines = res.stdout.split('\n');
        for (let i = 0; i < testArgs.length; i++) {
            const line = lines[i];
            let result;
            if (line === 'errorThrown') {
                result = getErrorResult(twoResult);
            } else if (twoResult) {
                result = line.split(' ');
            } else {
                result = line;
            }
            testCases.push({ args: testArgs[i], result });
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
    LongValueExact: {
        argsFn: (first) => [first],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    IntValueExact: {
        argsFn: (first) => [first],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ShortValueExact: {
        argsFn: (first) => [first],
        twoOp: false,
        twoResult: false,
        randomize: false
    },
    ByteValueExact: {
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
    // Divide that has only divisor
    Divide2: {
        argsFn: ([f, s]) => [f, s],
        twoOp: true,
        twoResult: false,
        randomize: false
    },
    // Divide that has divisor and rounding mode
    Divide3: {
        argsFn: ([f, s]) => [f, s, Math.floor(Math.random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    // Divide that has divisor, scale and rounding mode
    Divide4: {
        argsFn: ([f, s]) =>
            [f, s, Math.floor(Math.random() * smallScale) - smallScale, Math.floor(Math.random() * maxRoundingMode)],
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
    Precision: {
        argsFn: (f) => [f],
        twoOp: false,
        twoResult: false,
        randomize: false
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
            Math.floor(Math.random() * smallScale) - smallScale
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    SetScale: {
        argsFn: (f) => [
            f,
            Math.floor(Math.random() * smallScale) - smallScale,
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
    }
}

run().catch(console.error);
