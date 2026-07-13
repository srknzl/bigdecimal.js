# Formatting Output

BigDecimal.js gives you both **Java-style** string methods and **JS-convention**
formatters, plus locale/currency formatting via the built-in `Intl.NumberFormat` — with
no extra dependency.

## Java-style strings

```js
const x = Big('123.4500')

x.toString()            // '123.4500'  — canonical, may use exponent for extreme scales
x.toPlainString()       // '123.4500'  — never uses exponent notation
x.toEngineeringString() // '123.4500'  — exponent is a multiple of 3
```

`toString()` is always valid JSON-number syntax, which is what makes
[lossless JSON](./lossless-json) work.

## JS-convention formatters

These mirror the `Number.prototype` methods but are **exact** and take an optional
`RoundingMode` (default `HALF_UP`):

```js
const x = Big('1234.56789')

x.toFixed(2)        // '1234.57'   — exactly N decimals, never exponential
x.toExponential(2)  // '1.23e+3'   — JS exponential notation
x.toPrecision(3)    // '1.23e+3'   — N significant digits

// Pick the rounding explicitly:
Big('2.5').toFixed(0, RoundingMode.HALF_EVEN) // '2'  (banker's rounding)
Big('2.5').toFixed(0, RoundingMode.HALF_UP)   // '3'
```

## Locale & currency with `toFormat`

`toFormat(locales?, options?)` passes the value to
[`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
as a string, so integer precision is preserved:

```js
const x = Big('1234.56789')

x.toFormat('en-US') // '1,234.56789'
x.toFormat('de-DE') // '1.234,56789'
x.toFormat('en-IN') // '1,234.56789'  (Indian digit grouping)

Big('1234.5').toFormat('en-US', { style: 'currency', currency: 'USD' }) // '$1,234.50'
Big('0.1567').toFormat('en-US', { style: 'percent' })                    // '15.67%'
```

<Playground :code="`const amount = Big('1052999.5')
console.log(amount.toFormat('en-US', { style: 'currency', currency: 'USD' }))
console.log(amount.toFormat('de-DE', { style: 'currency', currency: 'EUR' }))
console.log(amount.toFormat('ja-JP', { style: 'currency', currency: 'JPY' }))`" />

::: warning Full-precision `toFormat` needs a current engine
`toFormat` preserves full precision on **Node.js ≥ 20** and current browsers. On older
engines it falls back to double precision past ~15–17 significant digits. By default it
shows every decimal the value has (plain `Intl` otherwise caps at 3), except for
`currency`/`percent` styles where Intl's own rules apply. Anything in `options` overrides
these defaults.
:::

## Value coercion

BigDecimal implements `Symbol.toPrimitive`, so it behaves sensibly in template strings and
numeric contexts — string contexts are **exact**, numeric ones are **lossy** (like any JS
number):

```js
const x = Big('1234.56789')

`${x}` // '1234.56789'  — exact, same as toString()
+x     // 1234.56789    — lossy numberValue(), an IEEE-754 double
```

For explicit conversions use [`numberValue()`](../api/) (lossy),
[`numberValueExact()`](../api/) (throws if it can't be represented exactly), and
[`toBigInt()`](../api/) / [`toBigIntExact()`](../api/).

## Choosing a method

| You want… | Use |
| --- | --- |
| Exact canonical string | `toString()` / `toPlainString()` |
| Fixed number of decimals | `toFixed(n, roundingMode?)` |
| N significant digits | `toPrecision(n, roundingMode?)` |
| Exponential notation | `toExponential(n, roundingMode?)` |
| Locale / currency / percent | `toFormat(locales, options)` |
| A JS `number` (lossy) | `numberValue()` / `+x` |
| A `bigint` | `toBigInt()` / `toBigIntExact()` |
