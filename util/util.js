'use strict';
/**
 * Generates batches for better parallel execution
 */
module.exports.generateBatches = (testArgs, maxPromiseSize) => {
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
