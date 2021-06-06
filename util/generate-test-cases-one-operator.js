const util = require('util');
const exec = util.promisify(require('child_process').exec);
const testNumbers = require('./test-numbers');

const fs = require('fs');

async function runAbsJava(number, precision, roundingMode) {
    try {
        const { stdout, stderr } = await exec(`java -cp com/Abs Main ${number} ${precision} ${roundingMode}`);
        if (stderr !== '') return 'errorThrown';
        return stdout.trim();
    } catch (e) {
        return 'errorThrown';
    }
}

async function generateAbsTest(number, absTestCases) {
    const args = [
        number,
        Math.floor(Math.random() * 1000), // precision
        Math.floor(Math.random() * 8) // rounding mode
    ];
    const absResult = await runAbsJava(...args);
    absTestCases.push({
        arguments: args,
        result: absResult.trim()
    });
}

async function run() {
    const absOutputName = 'absTestCases.json';

    const absTestCases = [];

    const numberSet = new Set(); // Get unique set of numbers

    for (const tuple of testNumbers) {
        numberSet.add(tuple[0].toString());
        numberSet.add(tuple[1].toString());
    }

    if (fs.existsSync(absOutputName)) {
        console.log(`${absOutputName} exists, skipping generation.`);
    } else {
        console.log(`Generating ${absOutputName}..`);
        let counter = 0;
        for (const number of numberSet) {
            await generateAbsTest(number, absTestCases);
            counter++;
            if (counter % 100 === 0) console.log(counter);
        }
        fs.writeFileSync(absOutputName, JSON.stringify(absTestCases));
    }
}

run().catch(console.log);
