# Rust core: benchmark findings and why this branch is parked

**Status: parked / experimental. The shipping implementation stays pure-TypeScript on `main`.**

The `rust-core` branch reimplements the BigDecimal math as a pure Rust core
(`rust/crates/core`, JDK 26 semantics) exposed to Node via napi-rs and to the
browser via wasm-bindgen, driven by a thin JS facade. It is **correct** — the full
`test/**` suite (108 passing) and the JDK-26 golden fixtures pass against it.

It is also **slower than the TypeScript implementation on the operations that matter**,
and that is structural, not a tuning bug.

## Numbers (same benchmark, Apple M1, Node 24)

| Operation | TS impl (ops/s) | Rust/napi (ops/s) | Δ |
|---|---|---|---|
| Constructor | 43,962 | 12,483 | −72% |
| Add | 80,569 | 17,185 | −79% |
| Subtract | 73,518 | 16,642 | −77% |
| Multiply | 493,291 | 12,146 | −98% |
| Divide | 15,341 | 8,789 | −43% |
| Remainder | 9,362 | 3,588 | −62% |
| Positive pow | 27,403 | **7,642** | −72% vs old TS, but ~300× over big.js |
| Negative pow | 4,863 | 4,446 | −9% |
| Abs | 782,251 | 11,274 | −99% |
| Compare | 546,243 | 184,752 | −66% |

## Why it's structural

`abs` is the cheapest op (one operand, sign flip, one result), so it isolates the
boundary cost:

- TS `abs`: ~35 ns/call — in-process, V8 inlines it over a native `BigInt`.
- napi `abs`: ~2.4 µs/call — one napi crossing + allocating a boxed Rust `BigDecimal`
  + registering its GC finalizer + a JS wrapper.

That ~2.4 µs is a **floor** no facade optimization removes while returning a
native-backed object. A V8 `BigInt` add is ~35–100 ns with *no* crossing. You cannot
beat "no boundary" with "a boundary" for sub-microsecond operations, which is exactly
this library's hot path (`add`/`subtract`/`multiply`/`compareTo` on modest magnitudes).

The plan's premise — "the i128 fast-path beats the BigInt TS impl" — is false at this
granularity: the i128 saving (~tens of ns) is an order of magnitude smaller than the
crossing that wraps it.

## Where Rust does win

When there is real CPU work per call, the crossing amortizes:
- **pow / sqrt**: `pow` is 7,642 ops/s vs decimal.js 3,560 and ~300× over big.js.
- High-precision `divide`, very large magnitudes — arithmetic in the µs range where a
  2 µs crossing is noise.

That is a genuine but *narrow* niche, and not this library's common case.

## wasm doesn't rescue the common case

wasm is in-process (no finalizer, cheaper boundary), so it beats napi — but
`num-bigint` in wasm is typically slower than V8's native `BigInt`, and you still pay a
crossing + wrapper alloc. Net: still likely slower than TS for small operands. wasm's
value here is browser reach, not speed.

## Beyond speed, native also costs

- Per-platform prebuilt `.node` via a CI matrix + optional-dependency packages.
- Native addons don't load in some serverless/edge runtimes and complicate bundlers /
  Electron / `pkg`. The pure-TS package installs and runs everywhere in one `npm i`.

## Conclusion

Keep the pure-TS implementation as the default. The Rust work is preserved here as a
reference and as a possible **opt-in** backend for pow/sqrt/high-precision-heavy
workloads. The only native design that would pay off for general use is a batch /
expression API (build a graph in JS, cross once, evaluate in Rust) — a different
library, not a drop-in `BigDecimal`.
