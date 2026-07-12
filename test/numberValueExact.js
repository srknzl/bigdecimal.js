'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

// numberValueExact has no Java oracle (the JDK has no doubleValueExact), so
// cases are hand-written. Exact means: Big(x.numberValueExact()) equals x.

describe('numberValueExact', function () {
    it('returns the number when the value round-trips exactly', function () {
        Big('2').numberValueExact().should.equal(2);
        Big('-2.5').numberValueExact().should.equal(-2.5);
        Big('0').numberValueExact().should.equal(0);
        Big('0.1').numberValueExact().should.equal(0.1);
        Big('1e21').numberValueExact().should.equal(1e21);
        Big(String(Number.MAX_SAFE_INTEGER)).numberValueExact().should.equal(Number.MAX_SAFE_INTEGER);
    });
    it('throws RangeError when precision would be lost', function () {
        (() => Big('0.1000000000000000000001').numberValueExact()).should.throw(RangeError);
        (() => Big(2n ** 53n + 1n).numberValueExact()).should.throw(RangeError);
        (() => Big('1.7976931348623157e309').numberValueExact()).should.throw(RangeError); // overflows to Infinity
    });
    it('agrees with numberValue on exact values', function () {
        for (const s of ['3.5', '-123456', '0.25', '1e-3']) {
            Big(s).numberValueExact().should.equal(Big(s).numberValue());
        }
    });
});
