# Installation

BigDecimal.js is pure JavaScript with **zero runtime dependencies** and uses native
`BigInt`, so it runs anywhere `BigInt` does — Node.js 10.4+ and every modern browser
(Chrome 67+, Firefox 68+, Safari 14+). No polyfills, no build config.

The package ships CommonJS, ESM, and a minified UMD bundle, with TypeScript declarations
for each. The right one is picked automatically for your environment.

## Node.js

::: code-group

```sh [npm]
npm install bigdecimal.js
```

```sh [yarn]
yarn add bigdecimal.js
```

```sh [pnpm]
pnpm add bigdecimal.js
```

:::

Both module systems work out of the box:

```js
// ESM
import { Big, MC, RoundingMode } from 'bigdecimal.js'
```

```js
// CommonJS
const { Big, MC, RoundingMode } = require('bigdecimal.js')
```

## With a bundler

Vite, webpack, esbuild, Rollup, and Parcel all resolve the package's `exports` map and
tree-shake unused code (the package is marked `sideEffects: false`):

```js
import { Big } from 'bigdecimal.js'
```

Nothing else to configure — there is no `browser` shim or polyfill to wire up.

## Browser via CDN (no bundler)

Import the ESM build straight from a CDN with an import map or a module script:

```html
<script type="module">
  import { Big } from 'https://esm.sh/bigdecimal.js'
  console.log(Big('0.1').add(Big('0.2')).toString()) // 0.3
</script>
```

Or drop in the minified UMD bundle, which exposes a global `BigDecimalJS`:

```html
<script src="https://cdn.jsdelivr.net/npm/bigdecimal.js/lib/bigdecimal.umd.min.js"></script>
<script>
  const { Big } = BigDecimalJS
  console.log(Big('0.1').add(Big('0.2')).toString()) // 0.3
</script>
```

::: tip Pin a version in production
CDN URLs resolve to the latest release by default. Pin a version for reproducible builds,
e.g. `https://cdn.jsdelivr.net/npm/bigdecimal.js@1.6.0/lib/bigdecimal.umd.min.js`.
:::

## TypeScript

Types are bundled — there is nothing extra to install. The package exposes declarations
for both the ESM (`.d.mts`) and CommonJS (`.d.ts`) entry points, and every public method
is fully typed:

```ts
import { Big, BigDecimal, MC, RoundingMode } from 'bigdecimal.js'

const x: BigDecimal = Big('1.5')
const y: BigDecimal = x.divideWithMathContext(Big(3), MC(10, RoundingMode.HALF_EVEN))
```

Operands accept a union of `BigDecimal | bigint | number | string`, so you rarely need to
wrap literals:

```ts
Big('10').add(5).multiply('1.5').subtract(2n) // all valid operand types
```

## What gets shipped

The npm package contains only five files — the three builds and their type declarations:

| File | Format | Entry for |
| --- | --- | --- |
| `lib/bigdecimal.mjs` | ESM | `import`, bundlers, browsers |
| `lib/bigdecimal.js` | CommonJS | `require` |
| `lib/bigdecimal.umd.min.js` | UMD (minified) | `<script>` / CDN global `BigDecimalJS` |
| `lib/bigdecimal.d.mts` / `.d.ts` | TypeScript types | ESM / CJS |

Next: [Core Concepts →](./core-concepts)
