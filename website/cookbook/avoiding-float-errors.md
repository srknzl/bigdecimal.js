# Avoiding Floating-Point Errors

JavaScript numbers are IEEE-754 doubles. They store values in binary, and most decimal
fractions have no exact binary representation — so the moment you type `0.1`, you already
have a value that is *slightly* off. BigDecimal.js fixes this by storing the exact decimal.

## The classic traps

```js
0.1 + 0.2            // 0.30000000000000004
0.3 - 0.1            // 0.19999999999999998
0.1 * 3              // 0.30000000000000004
1.005 * 100          // 100.49999999999999  → naive rounding gives 100, not 101
0.1 + 0.2 === 0.3    // false
```

None of these are "bugs" in JavaScript — they're the unavoidable result of using binary
floating point for decimal data like money.

<Playground :code="`console.log('float:      ', 0.1 + 0.2)
console.log('bigdecimal: ', Big('0.1').add('0.2').toString())
console.log('equal?      ', Big('0.1').add('0.2').sameValue('0.3'))`" />

## Rule 1 — build from strings, not floats

The single most important habit. `Big(0.1)` receives a number that was *already* imprecise;
`Big('0.1')` parses the exact decimal you wrote:

```js
Big(0.1 + 0.2).toString()      // '0.30000000000000004'  ❌ the damage is already done
Big('0.1').add('0.2').toString() // '0.3'                 ✅ exact
```

Integers are safe either way (`Big(3)` is fine), but quote every non-integer literal.

## Rule 2 — never round with native math

The `1.005` problem: `Math.round(1.005 * 100) / 100` gives `1` cent short. Round with an
explicit `RoundingMode` instead:

```js
Big('1.005').setScale(2, RoundingMode.HALF_UP).toString() // '1.01'  ✅
```

## Rule 3 — compare with `compareTo`, not `===`

Two BigDecimals are the same *number* when `compareTo` returns `0` (or use `sameValue`).
Don't use `===` (reference identity) or `equals` unless you specifically care about scale:

```js
const a = Big('0.1').add('0.2')
a === Big('0.3')            // false — different objects
a.equals(Big('0.3'))       // true here, but equals also checks scale
a.compareTo(Big('0.30'))   // 0     — equal in value, scale-insensitive
a.sameValue(Big('0.30'))   // true
```

See [Core Concepts → equals vs compareTo](../guide/core-concepts#equals-vs-compareto-vs-samevalue).

## Rule 4 — accumulate exactly

Summing many small amounts is where float drift compounds. Stay in BigDecimal for the whole
loop and only convert at the end:

```js
const prices = ['0.1', '0.2', '0.3', '0.1', '0.1']

const total = prices.reduce((sum, p) => sum.add(p), Big(0))
total.toString() // '0.8'  (native reduce gives 0.7999999999999999)
```

<Playground :code="`const prices = ['0.1', '0.2', '0.3', '0.1', '0.1']
const floatTotal = prices.reduce((s, p) => s + Number(p), 0)
const exactTotal = prices.reduce((s, p) => s.add(p), Big(0))
console.log('float:', floatTotal)
console.log('exact:', exactTotal.toString())`" />

## When floats are fine

If you're doing graphics, physics, ML, or anything where a relative error of 10⁻¹⁶ is
irrelevant, plain `number` is faster and simpler — reach for BigDecimal when values are
**decimal by nature** (money, tax, billing, measurements with fixed precision) and errors
are unacceptable.
