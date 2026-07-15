# Contributing to BigDecimal.js

Thanks for your interest in improving BigDecimal.js! This guide covers the local setup, the
build/test loop, and how the Java-differential testing works.

## Project layout

The entire library is a **single source file**:

- **`src/bigdecimal.ts`** — the whole library (~4,700 lines). This is the only source you edit.
- `lib/` — compiled output (CJS `.js`, ESM `.mjs`, minified UMD, `.d.ts`). Generated; never hand-edit.
- `test/` — Mocha tests, including `test/jdk/` (ported JDK unit tests).
- `util/` — the Java-oracle test generator (see [`util/README.md`](util/README.md)).
- `benchmarks/` — the performance suite compared against big.js, bignumber.js, decimal.js.
- `website/` — the VitePress documentation site.

See [`CLAUDE.md`](CLAUDE.md) for the architecture in depth (compact/inflated fast path,
immutability, dual representation).

## Prerequisites

- **Node.js ≥ 18** (CI runs 18/20/22/24; the library itself supports Node ≥ 18).
- **Java (JDK 26)** on your `PATH` — only needed to *regenerate* differential test fixtures.

## Setup

```sh
git clone https://github.com/srknzl/bigdecimal.js.git
cd bigdecimal.js
npm install
```

## Build / test loop

Tests and benchmarks import the compiled `lib/`, so **compile after any source change**:

```sh
npm run compile   # tsc → CJS + ESM + UMD + .d.ts
npm test          # Mocha against lib/
npm run lint      # ESLint (--fix locally)
```

A typical change is: edit `src/bigdecimal.ts` → `npm run compile` → `npm test`.

## Correctness is defined as "matches Java"

BigDecimal.js is a port of `java.math.BigDecimal`; a result is *correct* when it matches the
JDK. Testing is therefore **Java-differential**:

- `util/batch/Main.java` is a JDK dispatcher. `npm run generate-test-files` streams generated
  cases through it and records Java's exact output — or the literal error it throws — into
  `util/output/*.json`.
- The Mocha tests in `test/` replay those cases and assert the JS library produces the
  identical string (or throws).

**Don't hand-edit the generated JSON.** If a case is wrong, fix the generator
(`util/`) or the Java oracle, then regenerate:

```sh
npm run generate-test-files   # requires `java` on PATH
```

CI also runs a weekly randomized fuzz (`fuzz.yml`) comparing thousands of random cases
against the JDK.

When you add or change behavior, add a case to the relevant generator in `util/` so it's
verified against Java — don't just assert an expected string by hand.

## Editing rules

- **Match Java semantics exactly** — rounding, scale of results, when `divide` throws, etc.
  When unsure, the JDK is the spec.
- **Keep the compact/inflated fast path** — new arithmetic should handle the `intCompact`
  case without inflating to `BigInt` when it can.
- **Preserve immutability** and the lazy caches (`_precision`, `stringCache`).
- **No runtime dependencies** — the package must stay dependency-free.
- Keep `@internal` JSDoc on private members so they're stripped from the published `.d.ts`.

## Documentation site

The docs live in `website/` (VitePress). The API reference is generated from the JSDoc in
`src/bigdecimal.ts` — edit the JSDoc, not the generated `website/api/` files.

```sh
npm run docs:dev     # compile lib + generate API + VitePress dev server
npm run docs:build   # full static build into website/.vitepress/dist
```

On push to `main`, `.github/workflows/generate-docs.yml` builds and deploys the site to
GitHub Pages.

## Benchmarks

```sh
npm run benchmark   # full suite, ~10 min; the output table is pasted into the README
```

## Submitting a change

1. Fork and branch from `main`.
2. Make your change in `src/bigdecimal.ts` (or `website/`, `util/`, etc.).
3. `npm run compile && npm test && npm run lint` — all green.
4. For behavior changes, add/adjust the Java-differential cases in `util/` and regenerate.
5. Open a PR describing the change and referencing any issue. CI must pass on all Node versions.

By contributing you agree your contributions are licensed under the project's
[Apache-2.0](LICENSE) license.
