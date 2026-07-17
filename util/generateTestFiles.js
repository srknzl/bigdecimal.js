'use strict';
// Run this script to generate all test cases in output directory
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testNumbers = require('./testNumbers');

// Seedable RNG (mulberry32) so generated fixtures and fuzz failures are reproducible:
// every run logs its seed, and TEST_GEN_SEED=<seed> replays the run exactly.
const seed = process.env.TEST_GEN_SEED !== undefined
    ? Number(process.env.TEST_GEN_SEED) >>> 0
    : require('crypto').randomInt(2 ** 32);
console.log(`Random seed: ${seed} (set TEST_GEN_SEED=${seed} to reproduce this run)`);

let rngState = seed;
function random() {
    rngState = rngState + 0x6D2B79F5 | 0;
    let t = Math.imul(rngState ^ rngState >>> 15, 1 | rngState);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

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
const numberOfChainTests = 8000;

// Uniform sampling almost never hits the values where representation switches
// (precision 15/16/17 straddles MAX_COMPACT_DIGITS, scale/exponent 0/±1). Bias
// ~30% of parameter draws onto those edges; the rest stay uniform as before.
function edgeOrRandom(edges, fn) {
    return random() < 0.3 ? edges[Math.floor(random() * edges.length)] : fn();
}
function randomPrecision() {
    // 0 (= unlimited) excluded from the edges: it already occurs uniformly and
    // biasing it would blow up Pow's exact-result sizes.
    return edgeOrRandom([1, 7, 15, 16, 17], () => Math.floor(random() * maxPrecision));
}
function randomTargetScale() {
    return edgeOrRandom([-16, -15, -1, 0, 1, 15, 16], () => Math.floor(random() * smallScale) - smallScale);
}
function randomPoint() {
    return edgeOrRandom([0, 1, -1, 15, -15, 16, -16],
        () => Math.floor(random() * (maxPoint - minPoint + 1) + minPoint));
}

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

        } else if (name === 'Chain') {
            console.log(`Number of test cases are ${numberOfChainTests}`);
            const pool = Array.from(testNumbers); // numberSet — the adversarial seeds are in here too
            testArgs = new Array(numberOfChainTests);
            for (let j = 0; j < numberOfChainTests; j++) {
                testArgs[j] = buildChain(pool);
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
        argsFn: (first) => [first, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    MovePointLeft: {
        argsFn: (first) => [first, randomPoint()],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    MovePointRight: {
        argsFn: (first) => [first, randomPoint()],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Negate: {
        argsFn: (first) => [first, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Plus: {
        argsFn: (first) => [first, randomPrecision(), Math.floor(random() * maxRoundingMode)],
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
            Math.floor(random() * 2 * maxPowNumber) - maxPowNumber,
            randomPrecision(),
            Math.floor(random() * maxRoundingMode)
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    Add: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Subtract: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Multiply: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Divide: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
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
        argsFn: ([f, s]) => [f, s, Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    // Divide that has divisor, scale and rounding mode
    Divide4: {
        argsFn: ([f, s]) =>
            [f, s, randomTargetScale(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    DivideToIntegralValue: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    Remainder: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
        twoOp: true,
        twoResult: false,
        randomize: true
    },
    DivideAndRemainder: {
        argsFn: ([f, s]) => [f, s, randomPrecision(), Math.floor(random() * maxRoundingMode)],
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
            Math.floor(random() * maxScale) - minScale,
            randomPrecision(),
            Math.floor(random() * maxRoundingMode),
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
            randomPrecision(),
            Math.floor(random() * maxRoundingMode),
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    ScaleByPowerOfTen: {
        argsFn: (f) => [
            f,
            randomTargetScale()
        ],
        twoOp: false,
        twoResult: false,
        randomize: true
    },
    SetScale: {
        argsFn: (f) => [
            f,
            randomTargetScale(),
            Math.floor(random() * maxRoundingMode),
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
            randomPrecision(),
            Math.floor(random() * maxRoundingMode),
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
    // Special-cased in generateJsonFile (see buildChain); kept last so it doesn't
    // shift the RNG stream of the other operations during a full regeneration.
    Chain: {
        argsFn: (f) => [f], // unused — Chain builds its own token arrays
        twoOp: false,
        twoResult: false,
        randomize: true
    },
};

// Operation-chain fuzzing. Single-op tests never exercise an *intermediate*
// result that lands on the compact/inflated boundary — but a chain like
// mul then add can produce one, which is exactly where the representation
// switch (and the 1.7.0 boundary bugs) live. Each chain is a linear fold:
// an operand, then 2–4 steps applied left to right. Serialized as
// space-separated RPN-ish tokens (one stdin line); Main.java is the oracle,
// test/chain.js replays the identical token stream in JS.
// Ops chosen to be exact and value-producing (no precision arg to blur
// divergences); div uses the 3-arg terminating form so it can't throw on a
// non-terminating expansion.
const CHAIN_OPS = ['add', 'sub', 'mul', 'div', 'neg', 'abs', 'mpl', 'mpr'];

function buildChain(pool) {
    const pick = () => pool[Math.floor(random() * pool.length)];
    const randInt = (lo, hi) => Math.floor(random() * (hi - lo + 1)) + lo;
    const tokens = [pick()];
    const steps = randInt(2, 4);
    for (let s = 0; s < steps; s++) {
        const op = CHAIN_OPS[Math.floor(random() * CHAIN_OPS.length)];
        tokens.push(op);
        if (op === 'add' || op === 'sub' || op === 'mul') {
            tokens.push(pick());
        } else if (op === 'div') {
            tokens.push(pick(), randInt(0, 30), randInt(0, 6)); // divisor, scale, rm (0..6 skips UNNECESSARY)
        } else if (op === 'mpl' || op === 'mpr') {
            tokens.push(randInt(-40, 40));
        } // neg, abs take no argument
    }
    return tokens;
}

/**
 * Generates random bigint
 */
function generateRandomBigInt() {
    const opCount = Math.floor(random() * 10) + 1; // do [1, 10] operations

    let result = 1n;

    for (let i = 0; i < opCount; i++) {
        const randomBigInt = BigInt(Math.floor(random() * Number.MAX_SAFE_INTEGER));
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
