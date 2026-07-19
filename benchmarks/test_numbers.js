'use strict';
const { Big: BigJs } = require('big.js');
const { Big } = require('../lib/bigdecimal.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');
const { Decimal } = require('decimal.js');
const { BigNumber } = require('bignumber.js');

const bigDecimalStrings = [
    '1234',
    '-11222235657.23149823092131232',
    '21222235657.2310958697014231232',
    '0.123',
    '-311231231.232323451293871233',
    '1222235657.2310958697014231232',
    '0.12',
    '51222235657.2310958697014231232',
    '12',
    '0.1234567',
    '7.2222356512123112317E233',
    '0.12345678',
    '0.123456',
    '-1222231123123235657.1232312456',
    '12345678',
    '-412222232333543455657.231245678',
    '0.1234',
    '-0.123456789',
    '123',
    '922212222311231232356572356512222311231232356577E-23',
    '-1222235657.23149823092131232',
    '1222235632257.2312122222222222222222222222222222223123123123123123124',
    '1.2222356512123112317E233',
    '-0.1',
    '515454222235689895237.23222124567',
    '123456789',
    '41222235657.23149823092131232',
    '-0.12345',
    '11231231.232323451293871233',
    '1',
    '12345',
    '123456',
    '-61222235632257.2312122222222222222222222222222222223123123123123123124',
    '2342311222235657E66',
    '-1234567',
    '1222231123123235657.1232312456',
];

const bigDecimals = []; // for BigDecimal.js
const bigDecimalsBigjs = []; // for big.js
const bigDecimalsBigNumber = []; // for BigNumber.js
const bigDecimalsDecimal = []; // for decimal.js
const bigDecimalsGWT = []; // for gwt based bigdecimal

for (const x of bigDecimalStrings) {
    bigDecimals.push(Big(x));
    bigDecimalsBigjs.push(BigJs(x));
    bigDecimalsBigNumber.push(BigNumber(x));
    bigDecimalsDecimal.push(Decimal(x));
    bigDecimalsGWT.push(GWTDecimal(x));
}

// Representation cohorts.
//
// bigdecimal.js keeps a significand of <= MAX_COMPACT_DIGITS (15) digits in a plain
// `number` and only inflates to `bigint` beyond that. The compact path is roughly
// 2.3x faster for Add, but this dataset is an even 18/18 mix, and a blended rate is
// dominated by the slow operands — so the blended figure lands near the inflated one
// and hides the fast path entirely. Splitting by representation reports each regime
// instead of an average that describes neither.
//
// Partitioned by string so every library receives exactly the same values.
const compactStrings = bigDecimalStrings.filter((s) => Big(s).precision() <= 15);
const inflatedStrings = bigDecimalStrings.filter((s) => Big(s).precision() > 15);

const cohort = (strings) => ({
    strings,
    bigDecimals: strings.map((s) => Big(s)),
    bigjs: strings.map((s) => BigJs(s)),
    bigNumber: strings.map((s) => BigNumber(s)),
    decimal: strings.map((s) => Decimal(s)),
    gwt: strings.map((s) => GWTDecimal(s)),
});

module.exports = {
    bigDecimalStrings,
    bigDecimals: bigDecimals,
    bigDecimalsBigjs: bigDecimalsBigjs,
    bigDecimalsBigNumber: bigDecimalsBigNumber,
    bigDecimalsDecimal: bigDecimalsDecimal,
    bigDecimalsGWT: bigDecimalsGWT,
    compact: cohort(compactStrings),
    inflated: cohort(inflatedStrings),
};
