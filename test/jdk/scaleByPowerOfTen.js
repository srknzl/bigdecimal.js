'use strict';
const { Big } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('ScaleByPowerOfTen JDK', function () {

    it('scaleByPowerOfTen test', function () {
        for (let i = -10; i < 10; i++) {
            Big(1).scaleByPowerOfTen(i).equals(Big(BigInt(1), -i)).should.be.true;
            Big(1).negate().scaleByPowerOfTen(i).equals(Big(BigInt(-1), -i)).should.be.true;
        }
    });

});
