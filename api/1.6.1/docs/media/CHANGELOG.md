# Changelog

All notable changes to `bigdecimal.js` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the
[GitHub Releases](https://github.com/srknzl/bigdecimal.js/releases) page.

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

[1.6.1]: https://github.com/srknzl/bigdecimal.js/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/srknzl/bigdecimal.js/compare/v1.5.2...v1.6.0
