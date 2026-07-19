# Changelog

All notable changes to `bigdecimal.js` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the
[GitHub Releases](https://github.com/srknzl/bigdecimal.js/releases) page.

## [Unreleased]

## [1.7.1]

### Licensing

- **Relicensed from Apache-2.0 to `GPL-2.0-only WITH Classpath-exception-2.0`,
  effective this release.** This library is a port of `java.math.BigDecimal` from
  OpenJDK, which is distributed under GPLv2 with the Classpath Exception. A
  translation of that source is a derivative work of it, and the Classpath
  Exception permits linking without GPL propagation but does not grant permission
  to relicense the OpenJDK source under different terms. The project now carries
  its upstream terms. See [`PROVENANCE.md`](PROVENANCE.md).
- **Versions up to and including 1.7.0 were published under Apache-2.0.** What
  recipients of those versions hold is deliberately not asserted here. This project's
  own copyright holders cannot retract a grant they made over what they own, but that
  is narrower than the whole derivative having been validly Apache-2.0 to begin with:
  if that label was not a grant this project was in a position to make over
  OpenJDK-derived material, upstream GPL rights in that material are not neutralised
  by it. Recorded as an open item in [`PROVENANCE.md`](PROVENANCE.md) pending counsel.
- **The Classpath Exception is what keeps this usable.** You may depend on
  `bigdecimal.js` from a program under any license, including a proprietary one,
  without that program becoming subject to the GPL. GPL obligations attach to this
  library's own source and to modifications of it, not to independent modules that
  link against it.

### Fixed

- **Malformed `precision` or `scale` could hang or corrupt a value.** Java types
  both as `int`; JavaScript has only `number`, and neither was validated. A
  fractional precision reached the digit-stepping precision-reduction loops in
  `round()` and `sqrt()`, which can never converge on a non-integer target —
  `Big('1.2345').round(MC(1.5))` and `Big(2).sqrt(MC(1.5))` looped forever. A
  non-finite scale reached the string layout, so `Big(1n, NaN)` produced `'1ENaN'`
  and `Big(123n, 2.9)` produced `'.12'` with a non-integer `scale()`. Both are now
  validated at construction: `MathContext` requires an integer precision in
  `[0, 2147483647]`, and `Big(value, scale)` requires an integer scale in the
  32-bit range. Rejected inputs throw `RangeError`.
- **`equals()` returned `false` across the CJS and ESM builds.** The two bundles
  are compiled separately and so have distinct class identities, making the
  `instanceof` guard fail for values that are genuinely equal. A foreign
  `BigDecimal` is now recognised through a global-registry brand and compared by
  canonical string form — deliberately not by internal fields, since a foreign
  instance may originate from a different version.
- **The advertised browser floor was not actually met.** The sole use of optional
  chaining (`options?.style` in `toFormat`) is ES2020 syntax that the `es2020`
  target emits verbatim, so every bundle failed to parse on Chrome 67–79 and
  Firefox 68–73 despite the documented Chrome 67+ / Firefox 68+ support. Replaced
  with an explicit `&&` guard; the compiled output is now free of optional
  chaining.

### Changed

- `Big(aBigDecimal, undefined, mc)` now applies the `MathContext` (rounding the
  copy), consistent with construction from a string, number, or bigint; it was
  previously ignored silently. Passing a `scale` together with a `BigDecimal`
  now throws `RangeError` (as it already did for strings) instead of being
  ignored.
- The shared `MathContext` constants (`UNLIMITED`, `DECIMAL32`, `DECIMAL64`,
  `DECIMAL128`) are now `Object.freeze`d, so a caller can no longer mutate global
  state through them. `BigDecimal` instances are deliberately not frozen — the
  lazy `precision`/`toString` caches need to remain writable.

### Documentation

- `toFormat()` now documents that it is display-oriented and lossy beyond 100
  decimal places: ECMA-402 caps `maximumFractionDigits` at 100, so a value whose
  significant digits fall past the 100th decimal place formats as `'0'`. Use
  `toPlainString()`/`toString()` when every digit matters.
- `toJSON()` now documents that its plain notation expands large positive
  exponents dramatically — `Big('1E+100000')` serialises to 100,001 characters
  where `toString()` emits nine. The behaviour is unchanged in this patch;
  switching the JSON representation is a breaking change deferred to 2.0.
- `test/jdk/NOTICE.md` now states the licensing of the OpenJDK-derived test
  material explicitly (GPLv2 with Classpath Exception) and clarifies that the
  upstream header's reference to an accompanying GPL `LICENSE` file points at the
  OpenJDK distribution, and now also to this repository's own root `LICENSE`.

### Internal

- **Benchmark harness reworked so it stops overstating our own results.** The
  published table was not a like-for-like comparison in several rows, and the errors
  ran in our favour:
  - A winner is now declared **only** for rows that are genuinely comparable.
    Previously a row could disagree on its results, or compare different precision
    bases, and still be awarded a trophy with a footnote underneath. `Equals` was the
    worst case — bigdecimal.js implements Java's scale-sensitive `equals` while every
    other library does numeric equality, so the two are not the same operation — and
    it is now reported without a winner, as are `Sqrt`, `Negative pow` and the new
    `Constructor (from number)` row.
  - `MathContext` objects are hoisted out of the timed callbacks. Building one inside
    the loop taxed only the libraries whose API takes a context per call (ours and the
    GWT port) while big.js and BigNumber.js read a global configured once — a harness
    artefact that was penalising bigdecimal.js on `Divide`, `Round`, `Sqrt` and
    `Negative pow`.
  - Output equivalence is verified over **every** result in the batch rather than the
    last one, and in a **child process**, so stringifying results to compare them
    cannot warm the lazy `toString`/`precision` caches the suite is about to measure.
    The full-stream check immediately caught two real divergences that the
    single-sample check had passed.
  - `Positive pow`/`Negative pow` are unary but walked operands pairwise, silently
    skipping the last value; `Constructor` mixed string and number inputs, where only
    the string half is a fair race (the GWT port reads the exact binary double, the
    others the shortest repr). Margins now come from the measured error of both rates
    instead of a hard-coded 5% allowance, and read *within noise* when they overlap.
- The publish workflow now verifies that the release tag matches `package.json`'s
  version, and packs the tarball and smoke-tests it as an installed dependency
  (CJS require, ESM import, and `.d.ts` resolution under `nodenext`) before
  publishing.
- The Java-differential generator's random target scale is now symmetric about
  zero; the fallback previously drew from `[-1000, 0)`, so positive target scales
  were only ever reached through the edge-case list.

## [1.7.0]

### Fixed

Four correctness bugs at the compact/inflated representation boundary, ±(2⁵³ − 1).
The compact fast path ports JDK idioms that rely on Java `long`'s asymmetric
two's-complement range; JS safe integers are symmetric
(`Number.MIN_SAFE_INTEGER === -Number.MAX_SAFE_INTEGER`), which broke exactly at
the boundary:

- Compact additions overflowing past −(2⁵³ − 1) were silently wrong by one
  (e.g. `Big(-9007199254740989).add(-4)`); only positive overflow was guarded.
- Quotients equal to `-9007199254740991` could produce a corrupt instance whose
  `toString()` threw a `TypeError`.
- The same-sign test `(xs ^ ys) >= 0` (valid on Java `long`) truncates to int32 in
  JS; a misclassified pair could make `compareTo`/`sameValue` report two equal
  values as unequal.
- `divideToIntegralValue`/`remainder`/`divideAndRemainder` with operands of equal
  magnitude `±9007199254740991` returned quotient `0` instead of `±1`
  (magnitude comparison assumed an inflated significand is strictly larger than a
  compact one).

### Added

- Java's exact narrowing conversions, faithfully ported (nonzero fractional part or
  out-of-range throws `RangeError`, mirroring `ArithmeticException`):
  `intValueExact()`, `shortValueExact()`, `byteValueExact()` returning `number`, and
  `longValueExact()` returning `bigint` (Java `long` exceeds the safe range of `number`).
- JDK-name aliases for drop-in familiarity when porting Java code: `doubleValue()`,
  `toBigInteger()`, `toBigIntegerExact()`.
- `clamp(min, max)` — returns the value clamped to the inclusive range, comparing by
  value like `compareTo` (a JS-convention convenience mirroring Java 21's `Math.clamp`;
  `java.math.BigDecimal` itself has no equivalent). Throws `RangeError` if `min > max`.
- The Java-oracle test generator now always includes deterministic adversarial seeds at
  the compact/inflated boundary and the Java integral-type range edges; all differential
  fixtures regenerated against JDK 26 (these seeds are what caught the fourth bug above).

### Changed / Performance

Algorithmic rework of the former benchmark laggards (measured on Apple M1, Node 24;
verified against 840,000 randomized cross-checks vs 1.6.1 with zero result changes):

- `divideToIntegralValue` computes the integer quotient directly with one native
  truncating `BigInt` division on aligned significands, replacing the ported JDK
  bounded-precision divide-then-truncate pipeline — **~12× faster**, and `remainder` /
  `divideAndRemainder` inherit it (**~8× faster**). Both were the slowest operations
  vs other libraries; both are now the fastest.
- Trailing-zero stripping works in 15-digit chunks behind an O(1) binary
  trailing-zero probe instead of one bigint division per digit — `divide` **+40%**,
  `stripTrailingZeros` **+15%**, and every operation that normalizes scales benefits.
- The rounding pipeline does fewer bigint operations per round: cached power-of-ten
  divisors, the HALF_EVEN parity test only on an actual tie, half-way comparison only
  for half-way modes, and digit counts derived by comparison instead of string
  conversion — `round` **+62%**, `setScale` **+17%**, `pow` with negative exponents **+34%**.

### Changed

- Declared `engines.node` floor raised from `>=10.4.0` to `>=18`. The old floor was
  the `BigInt` minimum, but nothing verified it (CI tests Node 18–24) and no Node
  release below 18 is maintained. The shipped code is unchanged and still targets
  ES2020.
- `MathContext` now throws `RangeError` for an invalid rounding mode, like every
  other validation failure in the library (it was the single place that threw
  `TypeError`). Update any `catch` that matched on the error type.
- New docs page: [Error Handling](https://srknzl.github.io/bigdecimal.js/guide/error-handling)
  — the `RangeError` ≙ Java `ArithmeticException` mapping and every throwing condition.
- New docs page: [Performance](https://srknzl.github.io/bigdecimal.js/guide/performance)
  — where the speed comes from (native `BigInt` + the compact fast path), benchmark
  methodology, and V8 vs JavaScriptCore differences.

### Changed / Tooling

- The source now compiles under `noUncheckedIndexedAccess`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, and `noUnusedLocals`/`noUnusedParameters`, and is
  linted with typescript-eslint's type-checked rules on ESLint 9 flat config
  (previously the TypeScript source was not linted at all). No published-package
  changes.
- The Java-oracle test generator now uses a seeded RNG: every run logs its seed and
  `TEST_GEN_SEED=<seed>` replays it byte-identically, so checked-in fixtures and
  weekly fuzz failures are reproducible (previously `Math.random()` with no recorded
  seed).


## [1.6.2]

This is a correction release to clarify minimum supported Node version is 18.

## [1.6.1]

### Added

- **Documentation site** (VitePress) with getting-started, installation, core-concepts,
  formatting, and lossless-JSON guides; a cookbook (avoiding float errors, money &
  currency, rounding modes, percentages & tax); per-library migration guides (decimal.js,
  bignumber.js, big.js, Java); and an integrated TypeDoc API reference.
- **Live in-browser Playground** — runnable code editors throughout the docs, plus an
  "Open in StackBlitz" export, all running the library against the actual build.
- Migrated the versioned TypeDoc archives (1.5.2 and earlier) into the new site, reachable
  from a version picker.
- `CONTRIBUTING.md` and this `CHANGELOG.md`.

### Changed

- `generate-docs.yml` now builds **and deploys** the docs site to GitHub Pages
  (previously it built docs but never published them).
- Added `@example` blocks to the most-used methods, so they surface in editor hovers and
  the generated API reference.

> These are documentation/tooling changes only — the published npm package (its five
> shipped files and zero runtime dependencies) is unchanged from 1.6.0.

## [1.6.0]

### Added

- JS-convention formatting and value coercion: `toFixed`, `toExponential`, `toPrecision`,
  `toFormat` (`Intl`-based, no dependency), and `Symbol.toPrimitive`.
- `numberValueExact()` — converts to a `number`, throwing instead of silently rounding when
  the value can't be represented exactly.
- Dedicated ESM type declarations (`.d.mts`) alongside the CommonJS `.d.ts`.
- Documented lossless JSON round-tripping via `JSON.rawJSON` and reviver `context.source`.

### Fixed

- `toFormat` full-precision string formatting requires Node.js ≥ 20 (documentation had
  said 16).

### Changed / Security

- npm publishing now uses provenance (OIDC trusted publishing); added weekly JDK
  differential fuzzing in CI and a Node 18/20/22/24 test matrix.
- Resolved `serialize-javascript` and `minimatch` Dependabot alerts; bumped dev
  dependencies.

## Earlier releases

See [GitHub Releases](https://github.com/srknzl/bigdecimal.js/releases) and the
[tag history](https://github.com/srknzl/bigdecimal.js/tags) for 1.5.2 and earlier.

[1.7.1]: https://github.com/srknzl/bigdecimal.js/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/srknzl/bigdecimal.js/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/srknzl/bigdecimal.js/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/srknzl/bigdecimal.js/compare/v1.5.2...v1.6.0
