# Changelog

All notable changes to `bigdecimal.js` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the
[GitHub Releases](https://github.com/srknzl/bigdecimal.js/releases) page.

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

[1.7.0]: https://github.com/srknzl/bigdecimal.js/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/srknzl/bigdecimal.js/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/srknzl/bigdecimal.js/compare/v1.5.2...v1.6.0
