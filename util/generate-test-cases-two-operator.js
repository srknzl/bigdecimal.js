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
    const additionOutputName = 'additionTestCases.json';
    const subtractionOutputName = 'subtractionTestCases.json';
    const multiplicationOutputName = 'multiplicationTestCases.json';
    const divisionOutputName = 'multiplicationTestCases.json';

    const addTestCases = [];
    const subtractTestCases = [];
    const multiplyTestCases = [];
    const divideTestCases = [];

    if (fs.existsSync(additionOutputName)) {
        console.log(`${additionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${additionOutputName}..`);
        let counter = 0;
        for (const tuple of testNumbers) {
            await generateAddTest(tuple, addTestCases);
            counter++;
            if(counter % 100 === 0) console.log(counter);
        }
        fs.writeFileSync(additionOutputName, JSON.stringify(addTestCases));
    }

    if (fs.existsSync(subtractionOutputName)) {
        console.log(`${subtractionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${subtractionOutputName}..`);
        let counter = 0;
        for (const tuple of testNumbers) {
            await generateSubtractTest(tuple, subtractTestCases);
            counter++;
            if(counter % 100 === 0) console.log(counter);
        }
        fs.writeFileSync(subtractionOutputName, JSON.stringify(subtractTestCases));
    }

    if (fs.existsSync(multiplicationOutputName)) {
        console.log(`${multiplicationOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${multiplicationOutputName}..`);
        let counter = 0;
        for (const tuple of testNumbers) {
            await generateMultiplyTest(tuple, multiplyTestCases);
            counter++;
            if(counter % 100 === 0) console.log(counter);
        }
        fs.writeFileSync(multiplicationOutputName, JSON.stringify(multiplyTestCases));
    }

    if (fs.existsSync(divisionOutputName)) {
        console.log(`${divisionOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${divisionOutputName}..`);
        let counter = 0;
        for (const tuple of testNumbers) {
            await generateDivideTest(tuple, divideTestCases);
            counter++;
            if(counter % 100 === 0) console.log(counter);
        }
        fs.writeFileSync(divisionOutputName, JSON.stringify(divideTestCases));
    }



}

run().catch(console.log);
