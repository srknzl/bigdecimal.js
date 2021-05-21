const util = require('util');
const exec = util.promisify(require('child_process').exec);
const testNumbers = require('./test-numbers');

const fs = require('fs');

async function runAddJava(first, second) {
    const { stdout } = await exec(`java Main ${first} ${second}`);
    return stdout.trim();
}

async function runSubtractJava(first, second) {
    const { stdout } = await exec(`java Main ${first} ${second}`);
    return stdout.trim();
}

async function runDivideJava(first, second, precision, roundingMode) {
    const { stdout } = await exec(`java Main ${first} ${second} ${precision} ${roundingMode}`);
    return stdout.trim();
}

async function runAddTest(tuple, addTestCases) {
    const addResult = await runAddJava(tuple[0], tuple[1]);
    addTestCases.push({
        arguments: [tuple[0], tuple[1]],
        result: addResult.trim()
    });
}

async function runSubtractTest(tuple, subtractTestCases) {
    const subtractResult = await runSubtractJava(tuple[0], tuple[1]);
    subtractTestCases.push({
        arguments: [tuple[0], tuple[1]],
        result: subtractResult.trim()
    });
}

async function runDivideTest(tuple, divideTestCases) {
    if (Number.parseFloat(tuple[1]) !== 0) { // if second number is zero skip
        const divideResult = await runDivideJava(
            tuple[0],
            tuple[1],
            Math.floor(Math.random() * 100000), // random precision
            Math.floor(Math.random() * 8) // random rounding mode
        );
        divideTestCases.push({
            arguments: [tuple[0], tuple[1]],
            result: divideResult.trim()
        });
    }
}

async function run() {
    const addTestCases = [];
    const subtractTestCases = [];
    const divideTestCases = [];

    for (const tuple of testNumbers) {
        await runAddTest(tuple, addTestCases);
        await runSubtractTest(tuple, subtractTestCases);
        await runDivideTest(tuple, divideTestCases);
    }
    fs.writeFileSync('additionTestCases.json', JSON.stringify(addTestCases));
    fs.writeFileSync('subtractionTestCases.json', JSON.stringify(subtractTestCases));
    fs.writeFileSync('divisionTestCases.json', JSON.stringify(divideTestCases));

}

run().catch(console.log);


const util = require('util');
const exec = util.promisify(require('child_process').exec);
const multiplicationTests = require('./multiplication-tests');

const fs = require('fs');

async function runJava(first, second) {
    const { stdout} = await exec(`java Main ${first} ${second}`);
    return stdout.trim();
}

async function run() {
    const testCases = [];
    for (const tuple of multiplicationTests) {
        const result = await runJava(tuple[0], tuple[1]);
        testCases.push({
            arguments: [tuple[0], tuple[1]],
            result: result.trim()
        });
    }
    fs.writeFileSync('multiplicationTestCases.json', JSON.stringify(testCases));
}

run().catch(console.log);


