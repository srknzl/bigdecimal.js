const util = require('util');
const exec = util.promisify(require('child_process').exec);
const additionTests = require('./addition-tests');

const fs = require('fs');

async function runJava(first, second, result) {
    const { stdout, stderr } = await exec(`java Main ${first} ${second}`);
    return stdout.trim();
}

async function run() {
    const testCases = [];
    for (const tuple of additionTests) {
        const result = await runJava(tuple[0], tuple[1]);
        testCases.push({
            arguments: [tuple[0], tuple[1]],
            result: result.trim()
        });
    }
    fs.writeFileSync('additionTestCases.json', JSON.stringify(testCases));
}

run().catch(console.log);
