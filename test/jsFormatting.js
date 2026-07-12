'use strict';
const { Big, RoundingMode } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

// JS-ergonomics methods (toFixed / toExponential / toPrecision / toFormat /
// Symbol.toPrimitive). These have no Java oracle, so cases are hand-written and,
// where no float error occurs, cross-checked against Number.prototype for parity.

describe('toFixed', function () {
    it('formats with exactly fractionDigits decimals, never exponential', function () {
        Big('1234.56789').toFixed(2).should.equal('1234.57');
        Big('1').toFixed(2).should.equal('1.00');
        Big('0').toFixed(2).should.equal('0.00');
        Big('1.5').toFixed(0).should.equal('2'); // HALF_UP default
        Big('-1.5').toFixed(0).should.equal('-2');
        Big('12345').toFixed(0).should.equal('12345');
    });
    it('respects an explicit rounding mode', function () {
        Big('1.5').toFixed(0, RoundingMode.DOWN).should.equal('1');
        Big('1.25').toFixed(1, RoundingMode.HALF_EVEN).should.equal('1.2');
    });
    it('throws RangeError on non-negative-integer fractionDigits', function () {
        (() => Big('1').toFixed(-1)).should.throw(RangeError);
        (() => Big('1').toFixed(1.5)).should.throw(RangeError);
    });
    it('matches Number.prototype.toFixed where there is no float error', function () {
        for (const s of ['0', '1', '1.5', '12.34', '1234.5', '999.9', '-42.75', '0.5']) {
            for (const d of [0, 1, 2, 4]) {
                Big(s).toFixed(d).should.equal(Number(s).toFixed(d), `toFixed(${s}, ${d})`);
            }
        }
    });
});

describe('toExponential', function () {
    it('formats in JS exponential notation', function () {
        Big('1234.56789').toExponential(2).should.equal('1.23e+3');
        Big('0.0012').toExponential().should.equal('1.2e-3');
        Big('1.2').toExponential(2).should.equal('1.20e+0');
        Big('0').toExponential(2).should.equal('0.00e+0');
        Big('0').toExponential().should.equal('0e+0');
        Big('-1234.5').toExponential(0).should.equal('-1e+3');
        Big('100').toExponential().should.equal('1e+2');
    });
    it('handles rounding carry into an extra digit', function () {
        Big('9.99').toExponential(1).should.equal('1.0e+1');
    });
    it('throws RangeError on non-negative-integer fractionDigits', function () {
        (() => Big('1').toExponential(-1)).should.throw(RangeError);
        (() => Big('1').toExponential(2.5)).should.throw(RangeError);
    });
    it('matches Number.prototype.toExponential where there is no float error', function () {
        for (const s of ['0', '1', '1.5', '12.34', '1234.5', '0.0012', '999.9', '-42.75']) {
            for (const d of [0, 1, 2, 4]) {
                Big(s).toExponential(d).should.equal(Number(s).toExponential(d), `toExponential(${s}, ${d})`);
            }
        }
    });
});

describe('toPrecision', function () {
    it('returns toString() when precision is omitted', function () {
        Big('123.45').toPrecision().should.equal(Big('123.45').toString());
    });
    it('uses fixed or exponential like Number.prototype.toPrecision', function () {
        Big('1234.5').toPrecision(2).should.equal('1.2e+3');
        Big('123.45').toPrecision(5).should.equal('123.45');
        Big('1').toPrecision(3).should.equal('1.00');
        Big('0').toPrecision(3).should.equal('0.00');
        Big('0.00001234').toPrecision(2).should.equal('0.000012'); // adjusted -5 -> fixed
        Big('0.000001234').toPrecision(2).should.equal('0.0000012'); // adjusted -6 -> fixed
        Big('0.0000001234').toPrecision(2).should.equal('1.2e-7'); // adjusted -7 -> exp
    });
    it('throws RangeError on non-positive-integer precision', function () {
        (() => Big('1').toPrecision(0)).should.throw(RangeError);
        (() => Big('1').toPrecision(2.5)).should.throw(RangeError);
    });
    it('matches Number.prototype.toPrecision where there is no float error', function () {
        for (const s of ['0', '1', '1.5', '12.34', '1234.5', '0.0012', '999.9', '-42.75', '0.5']) {
            for (const p of [1, 2, 3, 5]) {
                Big(s).toPrecision(p).should.equal(Number(s).toPrecision(p), `toPrecision(${s}, ${p})`);
            }
        }
    });
});

describe('toFormat', function () {
    it('keeps all decimals by default and matches Intl.NumberFormat', function () {
        const s = '1234.56789';
        Big(s).toFormat('en-US').should.equal('1,234.56789');
        Big(s).toFormat('en-US').should.equal(
            new Intl.NumberFormat('en-US', { maximumFractionDigits: 5 }).format(s)
        );
    });
    it('preserves integer precision beyond a double', function () {
        const s = '12345678901234567890.12';
        Big(s).toFormat('en-US').should.equal('12,345,678,901,234,567,890.12');
    });
    it('defers to Intl defaults for currency/percent styles', function () {
        Big('1234.5').toFormat('en-US', { style: 'currency', currency: 'USD' })
            .should.equal(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format('1234.5'));
        Big('0.1256').toFormat('en-US', { style: 'percent' })
            .should.equal(new Intl.NumberFormat('en-US', { style: 'percent' }).format('0.1256'));
    });
    it('lets caller options override the defaults', function () {
        Big('1.12345').toFormat('en-US', { maximumFractionDigits: 2 }).should.equal('1.12');
    });
});

describe('Symbol.toPrimitive', function () {
    it('returns the exact string for string/default hints', function () {
        `${Big('1234.56789')}`.should.equal('1234.56789');
        String(Big('1.5')).should.equal('1.5');
        ('' + Big('2.25')).should.equal('2.25');
    });
    it('returns the (lossy) numberValue for the number hint', function () {
        (+Big('1.5')).should.equal(1.5);
        (Big('2') * 3).should.equal(6);
    });
});
