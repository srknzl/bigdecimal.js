# Performance

BigDecimal.js is the fastest arbitrary-precision decimal library on most operations —
on V8 (Node.js) it leads in 35 of the 38 benchmarked operations where a winner can be
fairly declared, usually by 1.2–5× and by 25× or more on `pow`, `ulp`,
`stripTrailingZeros`, and `movePointLeft`/`movePointRight`. This page
explains where that speed comes from, how the benchmarks are run, and how results vary
across JavaScript engines. For the full current numbers, see the
[benchmark results in the README](https://github.com/srknzl/bigdecimal.js#benchmark-results).

## Where the speed comes from

### Native `BigInt`

The arbitrary-precision arithmetic is done by the engine's native `BigInt` — highly
optimized C++ inside V8/JavaScriptCore — rather than by JavaScript digit-array code, which
is how most alternative libraries (big.js, bignumber.js, decimal.js) work. The library's
job is to add exact decimal *scale and rounding semantics* on top while staying out of
the engine's way.

### The compact fast path

`BigInt` is fast, but a plain `number` is faster still. Internally a value is
`unscaledValue × 10^-scale`, and when the unscaled value fits in 15 digits it is stored
as an ordinary safe-integer `number`; it only "inflates" to a `BigInt` when an operation
can no longer be proven exact in `number` range. Typical human-sized values — money,
percentages, measurements — spend their whole life on the compact path and never touch
`BigInt` at all.

This mirrors the design of Java's `BigDecimal` (a `long` fast path over `BigInteger`),
and it is why everyday inputs are where the library does best: on two-decimal-place
currency values, add, subtract, multiply, and comparison run 2.7–3.7× faster than the
nearest digit-array library.

### Fewer bigint operations, not micro-optimizations

For big operands the cost model is simple: what matters is *how many* `BigInt`
operations an API call performs, not JavaScript-level micro-optimizations around them.
The 1.7.0 rework of the division family is a good example: computing an integral
quotient with one native truncating division (instead of a ported bounded-precision
divide-then-truncate pipeline) made `divideToIntegralValue` ~12× faster and
`remainder` ~8× faster.

## Benchmark methodology

The suite lives in
[`benchmarks/`](https://github.com/srknzl/bigdecimal.js/tree/main/benchmarks) and
compares this library against big.js, bignumber.js, decimal.js, and the GWT-based
bigdecimal package:

- Each operation runs over a fixed set of decimal numbers mixing simple and complex
  values, via the [benchmark](https://www.npmjs.com/package/benchmark) micro-benchmark
  framework. The suite covers 42 operations, including separate *compact*, *inflated*,
  and *money* (two-decimal-place currency) cohorts for add, subtract, multiply, and
  compare.
- Before timing, a separate process checks that every library computes the same result
  for each operation. Rows where the libraries disagree, implement different semantics,
  or work to a different precision basis get no winner — that's why 38 of the 42 rows
  are ranked.
- Numbers reported are operations per second; each ranked README table row marks the
  fastest library and its lead over the runner-up, or *within noise* when the error
  intervals overlap. Raw results are written to `benchmarks/results.json`.
- Reproduce with `npm install && npm run benchmark` (about 10 minutes for the full
  suite).

Take micro-benchmarks for what they are: relative rankings on a fixed workload. Your
own workload's mix of value sizes matters more than any single row.

## Engine differences: V8 vs JavaScriptCore

Because the heavy lifting is native `BigInt`, relative results depend on the engine's
`BigInt` implementation. The README table is measured on Node.js (V8); running the same
suite under Bun (JavaScriptCore, the engine of Safari) on 1.7.1, the library still wins
35 of the 38 ranked rows, but a few outcomes flip — e.g. JavaScriptCore parses decimal
strings into `BigInt` more slowly, which costs the constructor its lead there. The gap
can also run the other way: memoised `toString` is 2.3× faster on V8 than on
JavaScriptCore for the identical code path. Reproduce with `bun benchmarks/index.js`.

## The two operations where it trails

`round` and `setScale` (with positive and with negative scales) are the exceptions on
V8: big.js wins them because its digit-array representation makes decimal truncation
nearly free (drop array entries), while a `BigInt`-based representation must divide by a
power of ten. That gap is representational — caching and string-slicing tricks were
measured and lost to native `BigInt` division. big.js leads `round` by about 3.8× and
`setScale` by about 2×; bignumber.js also edges ahead on `setScale` (1.1–1.4×), while
`round` still beats every library except big.js.

## Practical tips

- **Don't round more than you must.** Intermediate results can stay exact; apply
  `setScale`/`round` once at the boundary where you present or store the value.
- **`equals` is faster than `compareTo`** when scales are known to match — it can
  short-circuit on the representation without aligning scales.
- **Any input type is fine.** Strings, safe-integer `number`s, and `bigint`s all
  construct via the fast path; there's no need to pre-convert.
