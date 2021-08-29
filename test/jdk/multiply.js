'use strict';
const { Big } = require('../../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

describe('Multiply JDK', function () {

    it('multiply test', function () {
        const bd1 = [
            Big('123456789'),
            Big('1234567898'),
            Big('12345678987')
        ];

        const bd2 = [
            Big('987654321'),
            Big('8987654321'),
            Big('78987654321')
        ];

        // Two dimensional array recording bd1[i] * bd2[j] &
        // 0 <= i <= 2 && 0 <= j <= 2;
        const expectedResults = [
            [Big('121932631112635269'),
                Big('1109586943112635269'),
                Big('9751562173112635269')
            ],
            [Big('1219326319027587258'),
                Big('11095869503027587258'),
                Big('97515622363027587258')
            ],
            [Big('12193263197189452827'),
                Big('110958695093189452827'),
                Big('975156224183189452827')
            ]
        ];

        for (let i = 0; i < bd1.length; i++) {
            for (let j = 0; j < bd2.length; j++) {
                bd1[i].multiply(bd2[j]).equals(expectedResults[i][j]).should.be.true;
            }
        }

        const x = Big(8, 1);
        let xPower = Big(-1);
        for (let i = 0; i < 100; i++) {
            xPower = xPower.multiply(x);
        }
    });

});
