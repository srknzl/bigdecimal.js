// ESM entry point. There is exactly one implementation — the CJS facade
// (lib/bigdecimal.js, built from src/backend-node.js) over the Rust core. This
// wrapper re-exports it so `import { Big } from 'bigdecimal.js'` and
// `require('bigdecimal.js')` resolve to the same code, not two divergent impls.
// `npm run compile` installs this verbatim as lib/bigdecimal.mjs.
import backend from './bigdecimal.js';

export const { Big, MC, BigDecimal, MathContext, RoundingMode } = backend;
export default backend;
