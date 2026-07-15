'use strict';
const { Big, MC, RoundingMode } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

/**
 * Regression tests for the compact/inflated representation boundary.
 *
 * The compact fast path stores the significand as a JS number with the sentinel
 * INFLATED = Number.MIN_SAFE_INTEGER. Unlike Java's Long.MIN_VALUE, the JS safe-integer
 * range is symmetric (MIN_SAFE_INTEGER === -MAX_SAFE_INTEGER), so JDK idioms ported
 * verbatim can misbehave exactly at ±(2^53 - 1). Each test here reproduces a bug that
 * existed in <= 1.6.1.
 */
describe('Compact boundary test', function () {

    const MAX = Number.MAX_SAFE_INTEGER; // 9007199254740991

    it('should add compact numbers that overflow past -(2^53 - 1) exactly', function () {
        // Float sum rounds -9007199254740993 to -9007199254740992; the old guard only
        // checked positive overflow and returned the wrong compact value.
        Big(-9007199254740989).add(Big(-4)).toString().should.be.equal('-9007199254740993');
        Big(9007199254740989).add(Big(4)).toString().should.be.equal('9007199254740993');
        // Sums landing exactly on the boundary / sentinel
        Big(-9007199254740990).add(Big(-1)).toString().should.be.equal('-9007199254740991');
        Big(9007199254740990).add(Big(1)).toString().should.be.equal('9007199254740991');
        Big(-9007199254740990).add(Big(-2)).toString().should.be.equal('-9007199254740992');
        // Cross-check a window around the boundary against BigInt arithmetic
        for (let d = 0; d < 8; d++) {
            for (let e = 1; e < 8; e++) {
                const x = -(MAX - d);
                const expected = (BigInt(x) - BigInt(e)).toString();
                Big(x).add(Big(-e)).toString().should.be.equal(expected);
                Big(x).subtract(Big(e)).toString().should.be.equal(expected);
            }
        }
    });

    it('should produce a usable value when a quotient is exactly -(2^53 - 1)', function () {
        // Old code constructed intCompact === INFLATED with intVal === null; toString crashed.
        const q = Big('-90071992547409910')
            .divideWithMathContext(Big('10'), MC(16, RoundingMode.HALF_UP));
        q.toString().should.be.equal('-9007199254740991');
        q.precision().should.be.equal(16);
        q.add(Big(1)).toString().should.be.equal('-9007199254740990');
        q.equals(Big('-9007199254740991')).should.be.true;
        const q2 = Big('-9007199254740991000').divideToIntegralValue(Big(1000));
        q2.toString().should.be.equal('-9007199254740991');
    });

    it('should compare mixed-sign sums correctly despite int32 truncation', function () {
        // Java's same-sign test (xs ^ ys) >= 0 truncates to int32 in JS; a misclassified
        // pair stored a small value as inflated and compareTo saw it as larger.
        const xs = 209716 * 4294967296 + 2147483648; // int32(xs) < 0 while xs > 0
        const x10 = xs * 10;
        const sMin = x10 - MAX;
        const r0 = (((sMin - x10) % 4294967296) + 4294967296) % 4294967296;
        const delta = (2147483648 - r0 + 4294967296) % 4294967296;
        const ys = (sMin + delta + 1024) - x10; // ys < 0, int32(ys) < 0, |ys| safe
        ((xs ^ ys) >= 0).should.be.true; // sanity: this pair fools the old int32 test
        const sum = Big(xs, 0).add(Big(ys, 1));
        sum.toString().should.be.equal('5798205952.0');
        const same = Big(sum.toString());
        sum.compareTo(same).should.be.equal(0);
        sum.sameValue(same).should.be.true;
        sum.equals(same).should.be.true;
    });

    it('should handle ±(2^53 - 1) significands across representations', function () {
        Big(MAX).toString().should.be.equal('9007199254740991');
        Big('-9007199254740991').toString().should.be.equal('-9007199254740991');
        Big(MAX).negate().toString().should.be.equal('-9007199254740991');
        Big('-9007199254740991').negate().toString().should.be.equal('9007199254740991');
        Big(MAX).compareTo(Big('-9007199254740991')).should.be.equal(1);
        Big('-9007199254740991').compareTo(Big('-9007199254740991')).should.be.equal(0);
        Big('-9007199254740991').equals(Big(-9007199254740991n)).should.be.true;
        Big('-9007199254740991').abs().toString().should.be.equal('9007199254740991');
        Big('-9007199254740991').multiply(Big(1)).toString().should.be.equal('-9007199254740991');
    });
});
