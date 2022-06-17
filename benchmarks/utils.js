'use strict';

function attachEventsAndRun(suite) {
    return suite.on('start', function () {
        console.log(this.name + ' benchmark:');
    }).on('cycle', function (event) {
        console.log(String(event.target));
    }).on('complete', function () {
        const fastest = this.filter('fastest')[0];
        console.log(`${fastest.name} is the fastest\n`);
    }).run();
}

module.exports = { attachEventsAndRun };

