const { Big } = require('big.js');
const { Big: BigDecimal } = require('../lib/index.js');
const { BigDecimal: GWTDecimal } = require('bigdecimal');

const bigDecimalNumbers = [
    '-11222235657.23149823092131232',
    '21222235657.2310958697014231232',
    '-311231231.232323451293871233',
    '41222235657.23149823092131232',
    '51222235657.2310958697014231232',
    '-61222235632257.2312122222222222222222222222222222223123123123123123124',
    '7.2222356512123112317E233',
    '1222231123123235657.1232312456',
    '515454222235689895237.23222124567',
    '-412222232333543455657.231245678',
    '2342311222235657E66',
    '922212222311231232356572356512222311231232356577E-23',
    '11231231.232323451293871233',
    '-1222235657.23149823092131232',
    '1222235657.2310958697014231232',
    '1222235632257.2312122222222222222222222222222222223123123123123123124',
    '1.2222356512123112317E233',
    '-1222231123123235657.1232312456',
];

const bigDecimals = []; // for BigDecimal.js
const bigDecimalsBigjs = []; // for big.js
const bigDecimalsGWT = []; // for gwt based bigdecimal

for (const x of bigDecimalNumbers) {
    bigDecimals.push(BigDecimal(x));
}
for (const x of bigDecimalNumbers) {
    bigDecimalsBigjs.push(new Big(x));
}
for (const x of bigDecimalNumbers) {
    bigDecimalsGWT.push(GWTDecimal(x));
}

const smallDecimalNumbers = [
    '-0.1', '0.12', '0.123', '0.1234', '-0.12345', '0.123456', '0.1234567', '0.12345678', '-0.123456789',
    '1', '12', '123', '1234', '12345', '123456', '-1234567', '12345678', '123456789'
];

const smallDecimals = []; // for BigDecimal.js
const smallDecimalsBigjs = []; // for big.js
const smallDecimalsGWT = []; // for gwt based bigdecimal

for (const x of smallDecimalNumbers) {
    smallDecimals.push(BigDecimal(x));
}
for (const x of smallDecimalNumbers) {
    smallDecimalsBigjs.push(new Big(x));
}
for (const x of smallDecimalNumbers) {
    smallDecimalsGWT.push(GWTDecimal(x));
}

module.exports = {
    bigDecimals: bigDecimals,
    bigDecimalsBigjs: bigDecimalsBigjs,
    bigDecimalsGWT: bigDecimalsGWT,
    smallDecimals: smallDecimals,
    smallDecimalsBigjs: smallDecimalsBigjs,
    smallDecimalsGWT: smallDecimalsGWT,
};
