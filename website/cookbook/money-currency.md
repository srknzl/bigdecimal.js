# Money & Currency

Money is decimal by nature, so it's the canonical use case for BigDecimal. The rules:
**store amounts as BigDecimal, keep scale explicit, and round only at defined boundaries.**

## Represent amounts exactly

Build from strings and keep the currency's natural scale (2 for USD/EUR, 0 for JPY):

```js
import { Big, RoundingMode } from 'bigdecimal.js'

const price = Big('19.99')
const qty = 3

const subtotal = price.multiply(qty) // '59.97'
```

## Round to cents at the boundary

Compute at full precision, then `setScale(2, …)` when you display, persist, or charge:

```js
const taxRate = Big('0.0825')

const tax = subtotal.multiply(taxRate)          // '4.947525' — full precision
const total = subtotal.add(tax)                 // '64.917525'

total.setScale(2, RoundingMode.HALF_UP).toString() // '64.92'  — the amount to charge
```

::: tip Round once, at the edge
Don't round after every intermediate step — that accumulates bias. Keep full precision
through the calculation and round a single time when the value leaves your system (invoice
line, DB column, payment API).
:::

## Format for humans

`toFormat` delegates to `Intl.NumberFormat`, so you get correct symbols, grouping, and
decimal rules per locale — no dependency:

```js
const total = Big('64.92')

total.toFormat('en-US', { style: 'currency', currency: 'USD' }) // '$64.92'
total.toFormat('de-DE', { style: 'currency', currency: 'EUR' }) // '64,92 €'
total.toFormat('ja-JP', { style: 'currency', currency: 'JPY' }) // '¥65'  (JPY has 0 decimals)
```

<Playground :code="`const price = Big('19.99'), qty = 3
const subtotal = price.multiply(qty)
const tax = subtotal.multiply('0.0825')
const total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP)
console.log('subtotal:', subtotal.toFormat('en-US', { style: 'currency', currency: 'USD' }))
console.log('total:   ', total.toFormat('en-US', { style: 'currency', currency: 'USD' }))`" />

## Banker's rounding

Financial systems often use `HALF_EVEN` ("banker's rounding") to avoid the upward bias of
`HALF_UP` across many transactions — ties round to the nearest *even* digit:

```js
Big('2.5').setScale(0, RoundingMode.HALF_EVEN).toString() // '2'
Big('3.5').setScale(0, RoundingMode.HALF_EVEN).toString() // '4'
Big('2.125').setScale(2, RoundingMode.HALF_EVEN).toString() // '2.12'
```

See the [Rounding Modes](./rounding) page for all eight.

## Splitting a bill without losing cents

Dividing money rarely comes out even. Allocate the remainder deterministically so the parts
always sum back to the whole — never `divide` and hope:

```js
function split(total, ways) {
  const cents = total.setScale(2, RoundingMode.HALF_UP)
  const base = cents.divide(ways, 2, RoundingMode.DOWN) // floor each share to cents
  const remainder = cents.subtract(base.multiply(ways)) // leftover pennies
  const extra = remainder.multiply(100).numberValue()   // how many 0.01s to hand out

  return Array.from({ length: ways }, (_, i) =>
    i < extra ? base.add('0.01') : base)
}

const shares = split(Big('100.00'), 3)
shares.map((s) => s.toString())               // ['33.34', '33.33', '33.33']
shares.reduce((a, b) => a.add(b), Big(0)).toString() // '100.00' — nothing lost
```

<Playground :code="`function split(total, ways) {
  const cents = total.setScale(2, RoundingMode.HALF_UP)
  const base = cents.divide(ways, 2, RoundingMode.DOWN)
  const remainder = cents.subtract(base.multiply(ways))
  const extra = remainder.multiply(100).numberValue()
  return Array.from({ length: ways }, (_, i) => i < extra ? base.add('0.01') : base)
}
const shares = split(Big('100.00'), 3)
console.log(shares.map(s => s.toString()).join(', '))
console.log('sum:', shares.reduce((a, b) => a.add(b), Big(0)).toString())`" />

::: warning Don't store money as a JS number
Persisting `total.numberValue()` reintroduces float error. Store the **string**
(`total.toString()`) or an integer number of minor units, and rebuild with `Big(...)`.
:::
