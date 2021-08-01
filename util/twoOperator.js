'use strict';
const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const { generateBatches } = require('./util');
const testNumbers = require('./testNumbers');

const repeatCountForRandomTests = 10;
const maxPrecision = 1000;
const maxRoundingMode = 8;
const maxPromiseSize = 1000; // defines concurrency, repeatCountForRandomTests should divide this number

let counter = 0;

const withPrecAndRM = [
    'Add',
    'Subtract',
    'Multiply',
    'Divide',
    'DivideToIntegralValue',
    'Remainder',
    'DivideAndRemainder',
];

const twoResult = [
    'DivideAndRemainder',
];

const withoutPrecAndRM = [
    'CompareTo',
    'Equals',
    'Max',
    'Min',
];

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

async function generateJsonFile(name, outputDir, withPrecAndRM, twoResult) {
    const testCases = [];
    const fileName = path.join(outputDir, `${name[0].toLowerCase()}${name.slice(1)}TestCases.json`);

    if (fs.existsSync(fileName)) {
        console.log(`${fileName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${fileName}..`);

        let numberOfTestsCases = testNumbers.length;
        if (withPrecAndRM) {
            numberOfTestsCases *= repeatCountForRandomTests;
        }
        console.log(`Number of test cases are ${numberOfTestsCases}`);

        const testArgs = new Array(numberOfTestsCases);

        let i = 0;
        for (const tuple of testNumbers) {
            if (!withPrecAndRM) {
                testArgs[i] = [tuple[0], tuple[1]];
                i++;
            } else {
                for (let j = 0; j < repeatCountForRandomTests; j++) {
                    const randomPrec = Math.floor(Math.random() * maxPrecision);
                    const randomRM = Math.floor(Math.random() * maxRoundingMode);

                    testArgs[i] = [tuple[0], tuple[1], randomPrec, randomRM];
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

async function run(outputDir) {
    for (const name of withPrecAndRM) {
        await generateJsonFile(name, outputDir, true, twoResult.includes(name));
        counter = 0;
    }

    for (const name of withoutPrecAndRM) {
        await generateJsonFile(name, outputDir, false, twoResult.includes(name));
        counter = 0;
    }
}

module.exports = run;
