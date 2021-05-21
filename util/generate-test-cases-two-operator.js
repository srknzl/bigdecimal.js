const util = require('util');
const exec = util.promisify(require('child_process').exec);
const testNumbers = require('./test-numbers');

const fs = require('fs');

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

async function generateAddTest(tuple, addTestCases) {
    const args = [
        tuple[0],
        tuple[1],
        Math.floor(Math.random() * 1000), // precision
        Math.floor(Math.random() * 8) // rounding mode
    ];
    const addResult = await runAddJava(...args);
    addTestCases.push({
        arguments: args,
        result: addResult.trim()
    });
}

async function generateSubtractTest(tuple, subtractTestCases) {
    const args = [
        tuple[0],
        tuple[1],
        Math.floor(Math.random() * 1000), // precision
        Math.floor(Math.random() * 8) // rounding mode
    ];
    const subtractResult = await runSubtractJava(...args);
    subtractTestCases.push({
        arguments: args,
        result: subtractResult.trim()
    });
}

async function generateMultiplyTest(tuple, multiplyTestCases) {
    const args = [
        tuple[0],
        tuple[1],
        Math.floor(Math.random() * 1000), // precision
        Math.floor(Math.random() * 8) // rounding mode
    ];
    const multiplyResult = await runMultiplyJava(...args);
    multiplyTestCases.push({
        arguments: args,
        result: multiplyResult.trim()
    });
}

async function generateDivideTest(tuple, divideTestCases) {
    const args = [
        tuple[0],
        tuple[1],
        Math.floor(Math.random() * 1000), // precision
        Math.floor(Math.random() * 8) // rounding mode
    ];
    const divideResult = await runDivideJava(...args);
    divideTestCases.push({
        arguments: args,
        result: divideResult.trim()
    });
}

async function run() {
    const addTestCases = [];
    const subtractTestCases = [];
    const multiplyTestCases = [];
    const divideTestCases = [];

    for (const tuple of testNumbers) {
        await generateAddTest(tuple, addTestCases);
        await generateSubtractTest(tuple, subtractTestCases);
        await generateMultiplyTest(tuple, multiplyTestCases);
        await generateDivideTest(tuple, divideTestCases);
    }
    fs.writeFileSync('additionTestCases.json', JSON.stringify(addTestCases));
    fs.writeFileSync('subtractionTestCases.json', JSON.stringify(subtractTestCases));
    fs.writeFileSync('multiplicationTestCases.json', JSON.stringify(multiplyTestCases));
    fs.writeFileSync('divisionTestCases.json', JSON.stringify(divideTestCases));

}

run().catch(console.log);
