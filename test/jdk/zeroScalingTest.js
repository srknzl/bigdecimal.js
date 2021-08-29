'use strict';
const { Big, MC, MathContext, RoundingMode } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Zero scaling JDK', function () {

    const zeros = new Array(23);
    for (let i = 0; i < 21; i++) {
        zeros[i] = Big(0n, i - 10);
    }
    zeros[21] = Big(0n, -2147483648);
    zeros[22] = Big(0n, 2147483647);
    const longEnough = MC(50, RoundingMode.UNNECESSARY);
    const contexts = [
        MC(0, RoundingMode.UNNECESSARY),
        MC(100, RoundingMode.UNNECESSARY),
        MC(5, RoundingMode.UNNECESSARY),
        MC(4, RoundingMode.UNNECESSARY),
        MC(3, RoundingMode.UNNECESSARY),
        MC(2, RoundingMode.UNNECESSARY),
        MC(1, RoundingMode.UNNECESSARY),
    ];
    const element = Big(100, -2);

    it('add tests', function () {
        for (const zero1 of zeros) {
            for (const zero2 of zeros) {
                const expected = Big(0n, Math.max(zero1.scale(), zero2.scale()));
                zero1.add(zero2).equals(expected).should.be.true;
                zero1.add(zero2, MathContext.UNLIMITED).equals(expected).should.be.true;
                zero1.add(zero2, longEnough).equals(expected).should.be.true;
            }
        }

        // Test effect of adding zero to a nonzero value.
        for (const mc of contexts) {
            for (const zero of zeros) {
                if (Math.abs(zero.scale()) < 100) {
                    let preferredScale = Math.max(zero.scale(), element.scale());
                    if (mc.precision !== 0) {
                        if (preferredScale < -4)
                            preferredScale = -4;
                        else if (preferredScale > -(5 - mc.precision)) {
                            preferredScale = -(5 - mc.precision);
                        }
                    }

                    let result = element.add(zero, mc);
                    (result.scale() !== preferredScale || result.compareTo(element) !== 0).should.be.false;

                    result = zero.add(element, mc);
                    (result.scale() !== preferredScale || result.compareTo(element) !== 0).should.be.false;

                    result = element.negate().add(zero, mc);
                    (result.scale() !== preferredScale || result.compareTo(element.negate()) !== 0).should.be.false;

                    result = zero.add(element.negate(), mc);
                    (result.scale() !== preferredScale || result.compareTo(element.negate()) !== 0).should.be.false;

                }
            }
        }
    });

    it('subtract tests', function () {
        for (const zero1 of zeros) {
            for (const zero2 of zeros) {
                const expected = Big(0n, Math.max(zero1.scale(), zero2.scale()));
                zero1.subtract(zero2).equals(expected).should.be.true;
                zero1.subtract(zero2, MathContext.UNLIMITED).equals(expected).should.be.true;
                zero1.subtract(zero2, longEnough).equals(expected).should.be.true;
            }
        }

        // Test effect of adding zero to a nonzero value.
        for (const mc of contexts) {
            for (const zero of zeros) {
                if (Math.abs(zero.scale()) < 100) {
                    let preferredScale = Math.max(zero.scale(), element.scale());
                    if (mc.precision !== 0) {
                        if (preferredScale < -4)
                            preferredScale = -4;
                        else if (preferredScale > -(5 - mc.precision)) {
                            preferredScale = -(5 - mc.precision);
                        }
                    }

                    let result = element.subtract(zero, mc);
                    (result.scale() !== preferredScale || result.compareTo(element) !== 0).should.be.false;

                    result = zero.subtract(element, mc);
                    (result.scale() !== preferredScale || result.compareTo(element.negate()) !== 0).should.be.false;

                    result = element.negate().subtract(zero, mc);
                    (result.scale() !== preferredScale || result.compareTo(element.negate()) !== 0).should.be.false;

                    result = zero.subtract(element.negate(), mc);
                    (result.scale() !== preferredScale || result.compareTo(element) !== 0).should.be.false;

                }
            }
        }
    });

    it('multiply tests', function () {
        const ones = [Big(1, 0), Big(10, 1), Big(1000, 3), Big(100000000, 8)];

        const values = [];
        for (const a of zeros) {
            values.push(a);
        }
        for (const a of ones) {
            values.push(a);
        }

        for (const zero1 of zeros) {
            for (const value of values) {
                const expected = Big(0n, Math.trunc(Math.min(Math.max(zero1.scale() + value.scale(), -2147483648), 2147483647)));

                zero1.multiply(value).equals(expected).should.be.true;
                zero1.multiply(value, MathContext.UNLIMITED).equals(expected).should.be.true;
                zero1.multiply(value, longEnough).equals(expected).should.be.true;
            }
        }
    });

    it('divide tests', function () {
        const ones = [Big(1, 0), Big(10, -1), Big(100, -2), Big(1000, -3), Big(100000, -5)];

        for (const one of ones) {
            for (const zero of zeros) {
                const expected = Big(0n, Math.trunc(Math.min(Math.max(zero.scale() - one.scale(), -2147483648), 2147483647)));

                zero.divideWithMathContext(one).equals(expected).should.be.true;
                zero.divideWithMathContext(one, MathContext.UNLIMITED).equals(expected).should.be.true;
                zero.divideWithMathContext(one, longEnough).equals(expected).should.be.true;
            }
        }
    });

    it('setScale tests', function () {
        const scales = [
            -2147483648,
            -2147483648 + 1,
            -10000000,
            -3,
            -2,
            -1,
            0,
            1,
            2,
            3,
            10,
            10000000,
            2147483647 - 1,
            2147483647
        ];

        for (const zero of zeros) {
            for (const scale of scales) {
                zero.setScale(scale);
            }
        }
    });

    it('toEngineeringString tests', function () {
        const testCases = [
            ['0E+10', '0.00E+12'],
            ['0E+9', '0E+9'],
            ['0E+8', '0.0E+9'],
            ['0E+7', '0.00E+9'],

            ['0E-10', '0.0E-9'],
            ['0E-9', '0E-9'],
            ['0E-8', '0.00E-6'],
            ['0E-7', '0.0E-6'],
        ];

        for (const testCase of testCases) {
            Big(testCase[0]).toEngineeringString().should.be.eq(testCase[1]);
        }
    });

    it('ulp tests', function () {
        for (const zero of zeros) {
            zero.ulp().equals(Big(1, zero.scale())).should.be.true;
        }
    });

    it('setScaleDoesNotMutate tests', function () {
        // eslint-disable-next-line max-len
        const total = Big('258815507198903607775511093103396443816569106750031264155319238473795838680758514810110764742309284477206138527975952150289602995045050194333030191178778772026538699925775139201970526695485362661420908248887297829319881475178467494779683293036572059595504702727301324759997409522995072582369210284334718757260859794972695026582432867589093687280300148141501712013226636373167978223780290547640482160818746599330924736802844173226042389174403401903999447463440670236056324929325189403433689'
            // eslint-disable-next-line max-len
            + '.426167432065785331444814035799717606745777287606858873045971898862329763544687891847664736523584843544347118836628373041412918374550458884706686730726101338872517021688769782894793734049819222924171842793485919753186993388451909096042127903835765393729547730953942175461146061715108701615615142134282261293656760570061554783195726716403304101469782303957325142638493327692352838806741611887655695029948975509680496573999174402058593454203190963443179532640446352828089016874853634851387762579319853267317320515941105912189838719919259277721994880193541634872882180184303434360412344059435559680494807415573269199203376126242271766939666939316648575065702750502798973418978204972336924254702551350654650573582614211506856383897692911422458286912085339575875324832979140870119455620532272318122103640233069115700020760625493816902806241630788230268031695140687964931377988962507263990468276009750998066442971308866347136022907166625330623130307555914930120150437900510530537258665172619821272937026713977709974434967165159545592482710663639966781678268622620229577009317698254134914742098420792313931843709810905414336383757407675429663714210967924767434203021205270369316797752411974617662200898086335322218191674846795163102021505555508444216708745911194321674887527227200297039471799580744303346354057273540730643842091810899490590914195225087593013834388801018488174855060306804024894292757613618190472234110859436472645203753139820658279559340251226992556744343475086923568365637919479462424794554522865559888240039662899509652221329892034706445253487898044421278283079233226845124525434586324657471286953226255430662125870993375281512713207125720748163498642795960457639954616530163959004770092547297392499137383176609646505351001304840762905826237024982330597805063521162285806541220110524989649256399233792799406995068469271941269511818994954109392839548141262324660472253632382325038836831429045617036015122388070240133760858500132713255407855625837956886349324981003917084922808187223285051144454915441134217743066575863563572152133978905444998209075763950909784148142018992367290485890072303179512881131769414783097454103103347826517701720263541869335631166977965013552647906729408522950996105479525445916501155305220090853891226367184989434453290788068397817927893708837722255115237672194162924260945492012622891770365546831236789867922136747819364833843397165107825773447549885351449899330007200651144003961228091210630807333236718793283427788965479074476288255387824982443633190938302785760754436525586544523339170400053128503337395428393881357669568532722167493096151221381017320147344991331421789379785964440840684363041795410525097564979585773948558651896834067324427900848255265001498890329859444233861478388742393060996236783742654761350763876989363052609107226398858310051497856931093693697981165801539060516895227818925342535261227134364063673285588256280386915163875872231395348293505967057794409379709079685798908660258077792158532257603211711587587586356431658240229896344639704');
        total.setScale(0, RoundingMode.DOWN).equals(total.setScale(0, RoundingMode.DOWN)).should.be.true;
    });

});
