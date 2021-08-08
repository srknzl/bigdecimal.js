'use strict';
const { Big, MC } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('Stripping zero test JDK', function () {

    it('stripping zero test', function () {
        const bd1 = Big(11, -2147483648);
        const mc = MC(1);
        (() => bd1.round(mc)).should.throw(); // should overflow here
    });

});
