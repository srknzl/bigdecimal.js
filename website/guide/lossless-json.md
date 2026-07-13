# Lossless JSON

JSON is the weak spot of every decimal library. `JSON.parse` rounds numbers to IEEE-754
doubles **before your code runs**, and `JSON.stringify` turns a `BigDecimal` into a string
(via `toJSON()`), which changes the wire type for consumers expecting a JSON *number*
(Java's Jackson serializes `BigDecimal` as a bare number by default; OpenAPI `number`
schemas; etc.).

Modern engines (Node.js ≥ 21, Chrome ≥ 114) fix **both** directions.

## Parsing without losing precision

Use a reviver: `context.source` is the exact number text from the input, before any
rounding:

```js
import { Big } from 'bigdecimal.js'

const order = JSON.parse(
  '{"price":0.1000000000000000000001}',
  (key, value, context) =>
    typeof value === 'number' && context ? Big(context.source) : value,
)

order.price.toString() // '0.1000000000000000000001' — nothing rounded
```

::: tip Scope the reviver
The reviver above converts *every* number in the document. In real payloads, gate on known
keys (`if (key === 'price') …`) so you don't accidentally turn IDs or counts into
BigDecimals.
:::

## Stringifying as a bare JSON number

`JSON.rawJSON` emits full precision as an actual JSON number, not a quoted string:

```js
import { Big, BigDecimal } from 'bigdecimal.js'

// Must be a regular function reading this[key]: JSON.stringify calls toJSON()
// *before* the replacer, so `value` is already a string at this point.
function decimalReplacer(key, value) {
  return this[key] instanceof BigDecimal ? JSON.rawJSON(this[key].toString()) : value
}

JSON.stringify({ price: Big('0.10') }, decimalReplacer) // '{"price":0.10}'
```

`toString()` output is always valid JSON-number syntax, so the replacer is safe for every
value.

## Graceful fallback on older engines

Feature-detect and degrade cleanly:

```js
if (typeof JSON.rawJSON === 'function') {
  // full-precision JSON numbers
} else {
  // default toJSON() still round-trips exactly — just as a JSON string
}
```

On engines without `JSON.rawJSON`, `JSON.stringify(Big('0.10'))` produces `'"0.10"'` (a
string), which still round-trips losslessly through `Big(...)` on the way back in.

## Round trip in one place

```js
const wire = '{"amount":9999999999999999.99}'

const parsed = JSON.parse(wire, (k, v, ctx) =>
  typeof v === 'number' && ctx ? Big(ctx.source) : v)

parsed.amount.toString() // '9999999999999999.99' — exact, not 10000000000000000
```

A plain `JSON.parse(wire)` would have already rounded `amount` to `10000000000000000`
before you ever touched it.
