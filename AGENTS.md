# AGENTS.md

> **`CLAUDE.md` is a duplicate of this file. If you update this file, update `CLAUDE.md` too.**

BigDecimal for JS/TS, built on native `BigInt`. A faithful port of Java's
`java.math.BigDecimal` — API names and arithmetic semantics mirror the JDK, and
correctness is *defined* as "matches Java" (see Testing).

## Where the code is

- **`src/bigdecimal.ts`** — the entire library, ~4600 lines, one file. This is the
  only source you edit. Everything else is generated, test, or build glue.
- `lib/` — compiled output (CJS `.js`, ESM `.mjs`, UMD min, `.d.ts`). Generated; never hand-edit.
- `util/` — Java-oracle test generator. `test/` — mocha tests. `benchmarks/` — perf suite.

## Core architecture

`BigDecimal` is **immutable** and represents `unscaledValue × 10^(-scale)`. Every
operation returns a new instance; fields are `readonly` except the lazy caches
`_precision` and `stringCache`.

The value carries a **dual representation** mirroring the JDK — this is the whole
performance premise, so preserve it when touching arithmetic:

- `intCompact: number` — the significand when it fits in ≤15 digits (`MAX_COMPACT_DIGITS`).
  This is the fast path and most methods branch on it first.
- `intVal: bigint | null` — the "inflated" significand, used when the value is too big for a
  safe-integer `number`.
- `INFLATED` (= `Number.MIN_SAFE_INTEGER`) is the sentinel: `intCompact === INFLATED` means
  "significand lives in `intVal`". `inflated()` converts compact → bigint on demand.
- `_scale: number` (32-bit int range), `_precision: number` (lazy; `0` = not yet computed).

Native `BigInt` does the arbitrary-precision math; there are **no runtime dependencies**.
Requires Node ≥10.4 or a browser with `BigInt`. Don't add a runtime dep.

## Public API

Exports: `Big`, `MC`, `RoundingMode`, and the `BigDecimal` / `MathContext` classes.

- `Big(n, scale?, mc?)` — factory for `BigDecimal`, callable with or without `new`. The
  `BigDecimal` constructor is private; construction routes through `BigDecimal.fromValue`.
  Accepts `BigDecimal | bigint | number | string`. `number` must be a safe integer unless
  passed via string; non-safe/decimal numbers are stringified and parsed.
- `MC(precision, roundingMode?)` — factory for `MathContext` (default rounding `HALF_UP`).
- `@internal` JSDoc marks members stripped from `.d.ts` and typedoc output — keep it on privates.

## Editing rules

- **Match Java semantics exactly.** If unsure how an op behaves (rounding, non-terminating
  division throwing `RangeError`, scale of the result), the JDK is the spec.
- **Keep the compact/inflated fast path.** New arithmetic should handle `intCompact` without
  inflating to `bigint` when it can.
- Preserve immutability and the lazy caches.

## Build / test / benchmark

Tests and benchmarks import compiled `lib/`, so **`npm run compile` first** after any source change.

```
npm run compile     # tsc → CJS + ESM + UMD + .d.ts
npm test            # mocha against lib/
npm run benchmark   # full suite, ~10 min; output table is pasted into README
npm run lint
```

**Testing is Java-differential.** `util/` streams generated cases through a JDK 26 batch
dispatcher (`util/batch/Main.java`) and records Java's result — or the literal `errorThrown`
if Java throws — into `util/output/*.json`. `test/*.js` replay those cases and assert the JS
library produces the identical string (or throws). `test/jdk/` holds ported JDK unit tests.
Regenerate with `npm run generate-test-files` (needs `java` on PATH; see `util/README.md`).
Don't hand-edit the generated JSON — change the generator or the Java oracle instead.

## Performance notes

Fastest of the compared libraries on most operations. Known laggards are **algorithmic**, not
micro-opts: `Round`/`SetScale` (big.js's digit-array truncation beats us), and
`DivideToIntegralValue`/`Remainder` (the ported JDK division). Don't chase these with caching.
Relative results depend on the engine's `BigInt` impl (V8 vs JavaScriptCore differ).
