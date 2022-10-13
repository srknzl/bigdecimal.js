'use strict';
const { Big } = require('../lib/bigdecimal.js');
const chai = require('chai');
chai.should();

/* eslint-disable eqeqeq */
describe('Convert to primitive test', function () {
    it('should throw when calling JSON.stringify on BigDecimal', () => {
        const testCase = () => JSON.stringify(Big(0));
        testCase.should.throw('Do not know how to serialize a BigInt', undefined, 'expected JSON.stringify to throw');
    });

    it('should be able to convert to string (hint: string)', () => {
        const value = Big(0);
        const testCases = {
            '`${Big(0)}`': [() => `${value}`, '0'],
        };

        Object.entries(testCases).forEach(([key, [testCase, expected]]) => {
            testCase().should.equals(expected, `expected '${key}' to be '${expected}'`);
        });
    });

    it('should perform logical operators on BigDecimal without calling toPrimitive', () => {
        const value = Big(0);
        const testCases = {
            '&&': () => {
                value && 1;
            },
            '||': () => {
                value || "1";
            },
            '!': () => {
                !value;
            },
            '??': () => {
                value ?? Symbol(1);
            }
        };

        Object.entries(testCases).forEach(([key, testCase]) => {
            testCase.should.not.throw(undefined, undefined, `expected '${key}' to not throw`);
        });
    });

    it('should perform BigDecimal comparison without calling toPrimitive', () => {
        const value = Big(0);
        const testCases = {
            '=== Big': () => {
                value === value;
            },
            '=== 1': () => {
                value === 1;
            },
            '=== test': () => {
                value === 'test';
            },
            '=== Symbol(1)': () => {
                value === Symbol(1);
            },
            '=== Symbol("test")': () => {
                value === Symbol('test');
            },
            '=== 1n': () => {
                value === 1n;
            },
            '=== true': () => {
                value === true;
            },

            // loose equals
            '== Big': () => {
                value == value;
            },
            '== []': () => {
                value == [];
            },
            '== null': () => {
                value == null;
            },
            '== undefined': () => {
                value == undefined;
            }
        };

        Object.entries(testCases).forEach(([key, testCase]) => {
            testCase.should.not.throw(undefined, undefined, `expected '${key}' to not throw`);
        });
    });

    it('should throw when performing BigDecimal comparison with loose equal against primitive values', () => {
        // toPrimitive is not used for equality operators
        const value = Big(0);
        const testCases = {
            '== 1': () => {
                value == 1;
            },
            '== test': () => {
                value == 'test';
            },
            '== 1n': () => {
                value == 1n;
            },
            '== true': () => {
                value == true;
            },
            '== Symbol(1)': () => {
                value == Symbol(1);
            },
            '== Symbol("test")': () => {
                value == Symbol('test');
            }
        };

        Object.entries(testCases).forEach(([key, testCase]) => {
            testCase.should.throw(
                'BigDecimal cannot be implicitly converted to an ambiguous type',
                undefined,
                `expected '${key}' to throw`
            );
        });
    });

    it('should throw when converting to ambiguous type via addition or concatenation', () => {
        const value = Big(0);
        const testCases = {
            'Big(0) + 1': () => value + 1,
            'prefix + Big(0)': () => 'prefix' + value,
            'Big(0) + suffix': () => value + 'suffix',
        };

        Object.entries(testCases).forEach(([key, testCase]) => {
            testCase.should.throw(
                'BigDecimal cannot be implicitly converted to an ambiguous type',
                undefined,
                `expected '${key}' to throw`
            );
        });
    });

    it('should throw an error when converting to number type', () => {
        const value = Big(0);
        const testCases = {
            'unary +': () => {
                +value;
            },
            '-': () => {
                value - 1;
            },
            '*': () => {
                value * 1;
            },
            '/': () => {
                value / 1;
            },
            '%': () => {
                value % 1;
            },
            '**': () => {
                value ** 1;
            },
            '++': () => {
                value++;
            },
            '--': () => {
                value--;
            },
            '&': () => {
                value & 1;
            },
            '|': () => {
                value | 1;
            },
            '^': () => {
                value ^ 1;
            },
            '~': () => {
                ~value;
            },
            '>': () => {
                value > 1;
            },
            '<': () => {
                value < 1;
            },
            '>=': () => {
                value >= 1;
            },
            '<=': () => {
                value <= 1;
            },
            '>>': () => {
                value >> 1;
            },
            '<<': () => {
                value << 1;
            },
            '>>>': () => {
                value >>> 1;
            },
        };

        Object.entries(testCases).forEach(([key, testCase]) => {
            testCase.should.throw(
                'BigDecimal cannot be implicitly converted to a number type',
                undefined,
                `expected '${key}' to throw`
            );
        });
    });
});
