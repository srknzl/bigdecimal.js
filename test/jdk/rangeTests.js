'use strict';
const { Big, MathContext } = require('../../lib/bigdecimal');
const chai = require('chai');
chai.should();

describe('Range JDK', function () {

    const addTest = (arg1, arg2, expectedResult) => {
        arg1.add(arg2).equals(expectedResult).should.be.true;
        arg2.add(arg1).equals(expectedResult).should.be.true;
    };

    const testRoundingFromBigInteger = (bi, scale, mc) => {
        Big(bi, scale, mc).equals(Big(bi, scale).round(mc)).should.be.true;
    };

    it('add boundary test', function () {
        addTest(
            Big('85070591730234615847396907784232501249'),
            Big(0),
            Big('85070591730234615847396907784232501249'));
        addTest(
            Big('-85070591730234615847396907784232501249'),
            Big(0),
            Big('-85070591730234615847396907784232501249'));
        addTest(
            Big('85070591730234615847396907784232501249'),
            Big(1),
            Big('85070591730234615847396907784232501250'));
        addTest(
            Big('85070591730234615847396907784232501249'),
            Big(-1),
            Big('85070591730234615847396907784232501248'));
        addTest(
            Big('-85070591730234615847396907784232501250'),
            Big(-1),
            Big('-85070591730234615847396907784232501251'));
        addTest(
            Big('-85070591730234615847396907784232501249'),
            Big(1),
            Big('-85070591730234615847396907784232501248'));
        addTest(
            Big('147573952589676412927'),
            Big(2147483647),
            Big('147573952591823896574'));
        addTest(
            Big('-147573952589676412927'),
            Big(2147483647),
            Big('-147573952587528929280'));
        addTest(
            Big('79228162514264337593543950335'),
            Big(999),
            Big('79228162514264337593543951334'));
        addTest(
            Big('79228162514264337593543950335'),
            Big(Math.trunc(2147483647/2)),
            Big('79228162514264337594617692158'));
        addTest(
            Big('79228162514264337593543950335'),
            Big(Math.trunc(-2147483648/2)),
            Big('79228162514264337592470208511'));
        addTest(
            Big('-79228162514264337593543950335'),
            Big(Math.trunc(2147483647/2)),
            Big('-79228162514264337592470208512'));
        addTest(
            Big('79228162514264337593543950335'),
            Big(-(Math.trunc(-2147483648/2))),
            Big('79228162514264337594617692159'));
        addTest(
            Big('-9223372036854775808'),
            Big(1),
            Big('-9223372036854775807'));
        addTest(
            Big('9223372036854775808'),
            Big(-1),
            Big('9223372036854775807'));
    });

    it('roundingConstructor test', function () {
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            7, MathContext.DECIMAL64);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            0, MathContext.DECIMAL64);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            -7, MathContext.DECIMAL64);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            7, MathContext.DECIMAL128);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            177, MathContext.DECIMAL128);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            177, MathContext.DECIMAL32);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            177, MathContext.UNLIMITED);
        testRoundingFromBigInteger(
            BigInt('85070591730234615847396907784232501249'),
            0, MathContext.UNLIMITED);
    });

});
