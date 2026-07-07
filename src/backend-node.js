'use strict';
// Thin JS facade over the Rust `bigdecimal-core` (via the napi addon). It owns the
// JS ergonomics — union-typed args, number/bigint coercion, error types, aliases,
// toJSON, Big/MC factories — and delegates every arithmetic operation to the core,
// which implements the JDK 26 BigDecimal semantics. The public API is unchanged.
//
// This is the tracked source of the Node runtime entry point. `npm run compile`
// installs it verbatim as lib/bigdecimal.js (see the `install-backend` script),
// so the require path below is relative to lib/, its runtime home.
// ponytail: ESM (lib/bigdecimal.mjs) still comes from the old TS impl; a matching
// ESM facade is a packaging follow-up (P5), not needed for the Node CJS suite.
Object.defineProperty(exports, '__esModule', { value: true });

// napi addon (built via `napi build` in rust/crates/napi).
const native = require('../rust/crates/napi/index.js');
const Native = native.BigDecimal;

// RoundingMode: same numeric values as java.math.RoundingMode, with the TS-enum
// style reverse mapping (MathContext validates via `RoundingMode[mode]`).
const RoundingMode = {
    UP: 0, DOWN: 1, CEILING: 2, FLOOR: 3,
    HALF_UP: 4, HALF_DOWN: 5, HALF_EVEN: 6, UNNECESSARY: 7,
    0: 'UP', 1: 'DOWN', 2: 'CEILING', 3: 'FLOOR',
    4: 'HALF_UP', 5: 'HALF_DOWN', 6: 'HALF_EVEN', 7: 'UNNECESSARY',
};
exports.RoundingMode = RoundingMode;

class MathContext {
    constructor(precision, roundingMode = RoundingMode.HALF_UP) {
        if (precision < 0) {
            throw new RangeError('MathContext precision cannot be less than 0');
        } else if (!RoundingMode[roundingMode]) {
            throw new TypeError(`RoundingMode is invalid: ${roundingMode}`);
        }
        this.precision = precision;
        this.roundingMode = roundingMode;
    }
}
MathContext.UNLIMITED = new MathContext(0, RoundingMode.HALF_UP);
MathContext.DECIMAL32 = new MathContext(7, RoundingMode.HALF_EVEN);
MathContext.DECIMAL64 = new MathContext(16, RoundingMode.HALF_EVEN);
MathContext.DECIMAL128 = new MathContext(34, RoundingMode.HALF_EVEN);
exports.MathContext = MathContext;

const HALF_UP = RoundingMode.HALF_UP;
const mcP = (mc) => (mc ? mc.precision : 0);
const mcR = (mc) => (mc ? mc.roundingMode : HALF_UP);

// Convert any core-layer error into the RangeError the JS API contracts on.
function guard(fn) {
    try {
        return fn();
    } catch (e) {
        if (e instanceof RangeError || e instanceof TypeError) throw e;
        throw new RangeError(e && e.message ? e.message : String(e));
    }
}

// Build a native core BigDecimal from a JS value, mirroring the exact coercion
// rules of the original `fromValue`.
function buildNative(value, scale, mc) {
    if (typeof value === 'number') {
        if (value > Number.MAX_VALUE || value < -Number.MAX_VALUE) {
            throw new RangeError('Number must be in the range [-Number.MAX_VALUE, Number.MAX_VALUE]');
        }
        if (scale !== undefined && mc !== undefined) {
            throw new RangeError('When constructing from a number, you cannot give both scale and MathContext.');
        }
        if (!Number.isInteger(value)) {
            if (scale !== undefined) {
                throw new RangeError('You should not give scale when number is a double');
            }
            return guard(() => {
                const n = Native.fromString(String(value));
                return mc ? n.round(mc.precision, mc.roundingMode) : n;
            });
        }
        // integer number
        const safe = value > Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER;
        if (safe) {
            // unscaled = the integer, scale = scale ?? 0
            return guard(() =>
                Native.fromUnscaledScaleContext(String(value), scale ?? 0, mcP(mc), mcR(mc)));
        }
        // unsafe range: parse String(value) (may be exponential, e.g. MAX_VALUE),
        // taking its natural scale, or reinterpreting the digits at a given scale.
        return guard(() => {
            const parsed = Native.fromString(String(value));
            if (scale !== undefined) {
                return Native.fromUnscaledScaleContext(parsed.unscaledValueString(), scale, mcP(mc), mcR(mc));
            }
            return mc ? parsed.round(mc.precision, mc.roundingMode) : parsed;
        });
    }
    if (typeof value === 'bigint') {
        return guard(() =>
            Native.fromUnscaledScaleContext(value.toString(), scale ?? 0, mcP(mc), mcR(mc)));
    }
    if (value instanceof BigDecimal) {
        return value._c; // immutable — safe to share
    }
    if (scale !== undefined) {
        throw new RangeError('You should give scale only with BigInts or integers');
    }
    return guard(() => {
        const n = Native.fromString(String(value));
        return mc ? n.round(mc.precision, mc.roundingMode) : n;
    });
}

// Coerce a binary-op argument (no scale/mc) to a native core value.
function toNative(value) {
    if (value instanceof BigDecimal) return value._c;
    return buildNative(value, undefined, undefined);
}

class BigDecimal {
    /** @internal */
    constructor(core) {
        this._c = core;
    }

    static fromValue(value, scale, mc) {
        return new BigDecimal(buildNative(value, scale, mc));
    }

    // --- accessors ---
    signum() { return this._c.signum(); }
    scale() { return this._c.scale(); }
    precision() { return this._c.precision(); }
    numberValue() { return this._c.numberValue(); }
    unscaledValue() { return BigInt(this._c.unscaledValueString()); }

    // --- arithmetic ---
    add(augend, mc) {
        const a = toNative(augend);
        return new BigDecimal(guard(() => mc ? this._c.addWithContext(a, mc.precision, mc.roundingMode) : this._c.add(a)));
    }
    subtract(subtrahend, mc) {
        const s = toNative(subtrahend);
        return new BigDecimal(guard(() => mc ? this._c.subtractWithContext(s, mc.precision, mc.roundingMode) : this._c.subtract(s)));
    }
    multiply(multiplicand, mc) {
        const m = toNative(multiplicand);
        return new BigDecimal(guard(() => mc ? this._c.multiplyWithContext(m, mc.precision, mc.roundingMode) : this._c.multiply(m)));
    }
    divide(divisor, scale, roundingMode) {
        const d = toNative(divisor);
        if (d.signum() === 0) {
            if (this._c.signum() === 0) throw new RangeError('Division undefined');
            throw new RangeError('Division by zero');
        }
        if (roundingMode === undefined) {
            if (scale !== undefined) throw new RangeError('Rounding mode is necessary if scale is given.');
            return new BigDecimal(guard(() => this._c.divide(d)));
        }
        if (roundingMode < RoundingMode.UP || roundingMode > RoundingMode.UNNECESSARY) {
            throw new RangeError('Invalid rounding mode');
        }
        if (scale === undefined) {
            return new BigDecimal(guard(() => this._c.divideWithRounding(d, roundingMode)));
        }
        return new BigDecimal(guard(() => this._c.divideWithScale(d, scale, roundingMode)));
    }
    divideWithMathContext(divisor, mc) {
        const d = toNative(divisor);
        if (d.signum() === 0) {
            if (this._c.signum() === 0) throw new RangeError('Division undefined');
            throw new RangeError('Division by zero');
        }
        // No (or unlimited) context => the exact JDK divide(BigDecimal).
        if (!mc || mc.precision === 0) {
            return new BigDecimal(guard(() => this._c.divide(d)));
        }
        return new BigDecimal(guard(() => this._c.divideWithContext(d, mc.precision, mc.roundingMode)));
    }
    divideToIntegralValue(divisor, mc) {
        const d = toNative(divisor);
        return new BigDecimal(guard(() => this._c.divideToIntegralValueWithContext(d, mcP(mc), mcR(mc))));
    }
    remainder(divisor, mc) {
        const d = toNative(divisor);
        return new BigDecimal(guard(() => {
            const q = this._c.divideToIntegralValueWithContext(d, mcP(mc), mcR(mc));
            return this._c.subtract(q.multiply(d));
        }));
    }
    divideAndRemainder(divisor, mc) {
        const d = toNative(divisor);
        return guard(() => {
            const q = this._c.divideToIntegralValueWithContext(d, mcP(mc), mcR(mc));
            const r = this._c.subtract(q.multiply(d));
            return [new BigDecimal(q), new BigDecimal(r)];
        });
    }
    pow(n, mc) {
        return new BigDecimal(guard(() => this._c.powWithContext(n, mcP(mc), mcR(mc))));
    }
    sqrt(mc) {
        return new BigDecimal(guard(() => this._c.sqrt(mc.precision, mc.roundingMode)));
    }
    abs(mc) {
        return new BigDecimal(guard(() => this._c.absWithContext(mcP(mc), mcR(mc))));
    }
    negate(mc) {
        return new BigDecimal(guard(() => mc ? this._c.negateWithContext(mc.precision, mc.roundingMode) : this._c.negate()));
    }
    plus(mc) {
        if (mc === undefined) return this;
        return new BigDecimal(guard(() => this._c.round(mc.precision, mc.roundingMode)));
    }
    round(mc) {
        return new BigDecimal(guard(() => this._c.round(mc.precision, mc.roundingMode)));
    }
    setScale(newScale, roundingMode = RoundingMode.UNNECESSARY) {
        return new BigDecimal(guard(() => this._c.setScale(newScale, roundingMode)));
    }

    // --- comparison / selection ---
    compareTo(val) { return this._c.compareTo(toNative(val)); }
    equals(value) { return value instanceof BigDecimal ? this._c.equals(value._c) : false; }
    sameValue(val) { return this.compareTo(val) === 0; }
    gt(val) { return this.compareTo(val) > 0; }
    greaterThan(val) { return this.compareTo(val) > 0; }
    gte(val) { return this.compareTo(val) >= 0; }
    greaterThanOrEquals(val) { return this.compareTo(val) >= 0; }
    lt(val) { return this.compareTo(val) < 0; }
    lowerThan(val) { return this.compareTo(val) < 0; }
    lte(val) { return this.compareTo(val) <= 0; }
    lowerThanOrEquals(val) { return this.compareTo(val) <= 0; }
    min(val) { return new BigDecimal(this._c.min(toNative(val))); }
    max(val) { return new BigDecimal(this._c.max(toNative(val))); }

    // --- point movement / misc ---
    movePointLeft(n) { return new BigDecimal(guard(() => this._c.movePointLeft(n))); }
    movePointRight(n) { return new BigDecimal(guard(() => this._c.movePointRight(n))); }
    scaleByPowerOfTen(n) { return new BigDecimal(guard(() => this._c.scaleByPowerOfTen(n))); }
    stripTrailingZeros() { return new BigDecimal(this._c.stripTrailingZeros()); }
    ulp() { return new BigDecimal(this._c.ulp()); }

    // --- conversion / formatting ---
    toBigInt() { return BigInt(guard(() => this._c.toBigIntegerString())); }
    toBigIntExact() { return BigInt(guard(() => this._c.toBigIntegerExactString())); }
    toString() { return this._c.toString(); }
    toPlainString() { return this._c.toPlainString(); }
    toEngineeringString() { return this._c.toEngineeringString(); }
    toJSON() { return this.toPlainString(); }
}
exports.BigDecimal = BigDecimal;

function Big(value, scale, mc) {
    return BigDecimal.fromValue(value, scale, mc);
}
exports.Big = Big;

function MC(precision, roundingMode) {
    return new MathContext(precision, roundingMode);
}
exports.MC = MC;
