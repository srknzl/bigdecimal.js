# Coming from Java's BigDecimal

BigDecimal.js is a deliberate port of `java.math.BigDecimal`, so if you know the JDK class
you already know this library. Method names, arithmetic semantics, scale/precision rules,
`MathContext`, and `RoundingMode` all match. Correctness is *defined* as "matches Java" and
verified by differentially testing against a JDK oracle.

The differences are mostly about JavaScript conventions.

## Construction

Java's constructors and `valueOf` collapse into the single `Big` factory:

```java
// Java
BigDecimal a = new BigDecimal("1.5");
BigDecimal b = BigDecimal.valueOf(10);
BigDecimal c = BigDecimal.TEN;
```

```js
// BigDecimal.js
const a = Big('1.5')
const b = Big(10)
const c = Big(10) // no TEN/ONE/ZERO constants — just Big(n)
```

`Big` accepts `string | number | bigint | BigDecimal`, and works with or without `new`.

## Name & type mapping

| Java | BigDecimal.js |
| --- | --- |
| `new BigDecimal(s)` / `valueOf(x)` | `Big(x)` |
| `add` / `subtract` / `multiply` | same |
| `divide(d)` / `divide(d, scale, mode)` | `divide(d, scale?, roundingMode?)` |
| `divide(d, mc)` | `divideWithMathContext(d, mc)` |
| `divideToIntegralValue` / `remainder` | same |
| `pow` / `abs` / `negate` / `plus` | same |
| `sqrt(mc)` | same (MathContext required) |
| `setScale` / `round` / `stripTrailingZeros` | same |
| `movePointLeft` / `movePointRight` / `scaleByPowerOfTen` / `ulp` | same |
| `scale()` / `precision()` / `signum()` | same |
| `unscaledValue()` → `BigInteger` | `unscaledValue()` → `bigint` |
| `compareTo` / `equals` / `min` / `max` | same (identical semantics) |
| `doubleValue()` | `numberValue()` (alias: `doubleValue()`) |
| `intValueExact()` / `shortValueExact()` / `byteValueExact()` | same → `number` |
| `longValueExact()` | same → `bigint` (Java `long` exceeds safe `number` range) |
| `intValue()` / `longValue()` (truncate + wrap around) | none — the silent two's-complement wraparound is a bug farm; use `toBigInt()` and mask, or the `*ValueExact` family |
| `floatValue()` | none — JS has no float32; use `Math.fround(x.numberValue())` |
| `toBigInteger()` / `toBigIntegerExact()` | `toBigInt()` / `toBigIntExact()` (aliases: `toBigInteger()` / `toBigIntegerExact()`) |
| `toString` / `toPlainString` / `toEngineeringString` | same |
| `MathContext.DECIMAL64` etc. | `MathContext.DECIMAL64` etc. |
| `RoundingMode.HALF_EVEN` etc. | `RoundingMode.HALF_EVEN` etc. |
| throws `ArithmeticException` | throws `RangeError` |

## `equals` vs `compareTo` — identical to Java

The Java gotcha is the same gotcha here, on purpose: `equals` compares value **and** scale,
`compareTo` compares value only.

```js
Big('2.0').equals(Big('2.00'))    // false — like Java
Big('2.0').compareTo(Big('2.00')) // 0     — like Java
```

For value-only equality without writing `compareTo(y) === 0`, this library adds a
convenience Java doesn't have: `sameValue(y)`.

## Exceptions become `RangeError`

Java's `ArithmeticException` (non-terminating `divide`, `UNNECESSARY` rounding that isn't
exact, `numberValueExact` that can't fit) maps to JavaScript's `RangeError`:

```js
try {
  Big('1').divide(Big('3')) // Java: ArithmeticException
} catch (e) {
  e instanceof RangeError // true
}
```

## JavaScript-only conveniences

Beyond the Java surface you also get: comparison aliases `gt` / `gte` / `lt` / `lte`, sign
predicates `isZero` / `isNegative` / `isPositive`, JS-style formatters `toFixed` /
`toExponential` / `toPrecision`, `Intl`-based `toFormat`, and `toJSON` for lossless
serialization. See [Formatting Output](../guide/formatting).

<Playground :code="`// Java: new BigDecimal(&quot;1&quot;).divide(new BigDecimal(&quot;3&quot;), new MathContext(10))
Big('1').divideWithMathContext(Big('3'), MC(10)).toString()`" />
