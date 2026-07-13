# Percentages & Tax

Percentage math is where float error is most visible to end users — a receipt that's one
cent off is a support ticket. Keep everything in BigDecimal and round at the end.

## A percentage of a value

A percent is just a multiplication by `p / 100`:

```js
import { Big, RoundingMode } from 'bigdecimal.js'

function percentOf(value, percent) {
  return Big(value).multiply(percent).divide(100, 20, RoundingMode.HALF_UP).stripTrailingZeros()
}

percentOf('250', '8.25').toString() // '20.625'
```

Since `/100` always terminates, you can also just shift or divide exactly:

```js
Big('250').multiply('8.25').divide(100, 4, RoundingMode.HALF_UP).toString() // '20.6250'
```

## Adding tax

```js
const net = Big('49.99')
const vat = Big('0.19') // 19%

const tax = net.multiply(vat)                       // '9.4981'
const gross = net.add(tax)                          // '59.4881'

gross.setScale(2, RoundingMode.HALF_UP).toString()  // '59.49'
```

<Playground :code="`const net = Big('49.99')
const vatRate = Big('0.19')
const tax = net.multiply(vatRate)
const gross = net.add(tax)
console.log('net:  ', net.toString())
console.log('tax:  ', tax.setScale(2, RoundingMode.HALF_UP).toString())
console.log('gross:', gross.setScale(2, RoundingMode.HALF_UP).toString())`" />

## Extracting tax from a gross amount

Given a tax-inclusive total, recover the net and the tax portion. This division doesn't
terminate, so give it a scale:

```js
const gross = Big('59.49')
const rate = Big('0.19')

// net = gross / (1 + rate)
const net = gross.divide(Big(1).add(rate), 2, RoundingMode.HALF_UP) // '49.99'
const tax = gross.subtract(net)                                     // '9.50'
```

## Discounts

```js
function applyDiscount(price, percentOff) {
  const factor = Big(1).subtract(Big(percentOff).divide(100, 10, RoundingMode.HALF_UP))
  return Big(price).multiply(factor).setScale(2, RoundingMode.HALF_UP)
}

applyDiscount('79.99', '15').toString() // '67.99'
```

## Compound growth

Percentages compound with `pow`. Interest of 5% for 3 periods:

```js
const principal = Big('1000')
const growth = Big('1.05')

principal.multiply(growth.pow(3)).setScale(2, RoundingMode.HALF_UP).toString() // '1157.63'
```

<Playground :code="`const principal = Big('1000')
const rate = Big('0.05')
const growth = Big(1).add(rate)
for (const years of [1, 5, 10, 30]) {
  const value = principal.multiply(growth.pow(years)).setScale(2, RoundingMode.HALF_UP)
  console.log(years + 'y:', value.toString())
}`" />

::: tip Round for display, keep precision for math
Round to 2 decimals when you show a value, but if you feed a result back into the next
calculation, keep the full-precision BigDecimal — re-rounding at each step drifts.
:::
