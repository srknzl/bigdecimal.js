'use strict';
const path = require('path');
const chai = require('chai');
chai.should();

// The CJS and ESM bundles are compiled separately, so they have distinct class identities and
// a value from one fails `instanceof` in the other. equals() recognises a foreign BigDecimal
// via a global-registry brand and compares canonical string form. See BigDecimal.BRAND.
describe('Cross-loader (CJS/ESM) interop', function () {
    let cjs, esm;

    before(async function () {
        cjs = require('../lib/bigdecimal.js');
        esm = await import(require('url').pathToFileURL(
            path.join(__dirname, '..', 'lib', 'bigdecimal.mjs')).href);
    });

    it('the two builds really are distinct classes', function () {
        (cjs.BigDecimal === esm.BigDecimal).should.equal(false);
    });

    it('equals() is true across builds for equal value and scale', function () {
        cjs.Big('1.10').equals(esm.Big('1.10')).should.equal(true);
        esm.Big('1.10').equals(cjs.Big('1.10')).should.equal(true);
        cjs.Big('-0.001').equals(esm.Big('-0.001')).should.equal(true);
    });

    it('equals() still distinguishes scale across builds', function () {
        cjs.Big('1.10').equals(esm.Big('1.1')).should.equal(false);
        cjs.Big('1').equals(esm.Big('2')).should.equal(false);
    });

    it('equals() remains false for non-BigDecimal values', function () {
        const a = cjs.Big('1.10');
        a.equals(null).should.equal(false);
        a.equals(undefined).should.equal(false);
        a.equals({}).should.equal(false);
        a.equals('1.10').should.equal(false);
        a.equals(1.1).should.equal(false);
        // an unbranded look-alike must not be accepted
        a.equals({ toString: () => '1.10' }).should.equal(false);
    });
});
