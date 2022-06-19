/*
  Copyright (c) 2021 Serkan Özel. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions andg
  limitations under the License.
*/

/**
 * Specifies a `rounding policy` for numerical operations capable
 * of discarding precision. Each rounding mode indicates how the least
 * significant returned digit of a rounded result is to be calculated.
 * If fewer digits are returned than the digits needed to represent
 * the exact numerical result, the discarded digits will be referred
 * to as the `discarded fraction` regardless the digits'
 * contribution to the value of the number.  In other words,
 * considered as a numerical value, the discarded fraction could have
 * an absolute value greater than one.
 *
 * Each rounding mode description includes a table listing how
 * different two-digit decimal values would round to a one digit
 * decimal value under the rounding mode in question. The result
 * column in the tables could be gotten by creating a
 * `BigDecimal` number with the specified value, forming a
 * {@link MathContext} object with the proper settings
 * (`precision` set to `1`, and the `roundingMode` set to the rounding
 * mode in question), and calling {@link BigDecimal.round | round} on
 * this number with the proper `MathContext`.  A summary table showing the results
 * of these rounding operations for all rounding modes appears below.
 *
 * | Input | UP | DOWN | CEILING | FLOOR | HALF_UP | HALF_DOWN | HALF_EVEN | UNNECESSARY |
 * | --- | --- | --- | --- | --- | --- | --- | --- | --- |
 * | 5.5 | 6 | 5 | 6 | 5 | 6 | 5 | 6 | RangeError |
 * | 2.5 | 3 | 2 | 3 | 2 | 3 | 2 | 2 | RangeError |
 * | 1.6 | 2 | 1 | 2 | 1 | 2 | 2 | 2 | RangeError |
 * | 1.1 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | RangeError |
 * | 1.0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
 * | -1.0 | -1 | -1 | -1 | -1 | -1 | -1 | -1 | -1 |
 * | -1.1 | -2 | -1 | -1 | -2 | -1 | -1 | -1 | RangeError |
 * | -1.6 | -2 | -1 | -1 | -2 | -2 | -2 | -2 | RangeError |
 * | -2.5 | -3 | -2 | -2 | -3 | -3 | -2 | -2 | RangeError |
 * | -5.5 | -6 | -5 | -5 | -6 | -6 | -5 | -6 | RangeError |
 *
 */
export enum RoundingMode {
    /**
     * Rounding mode to round away from zero.  Always increments the
     * digit prior to a non-zero discarded fraction.  Note that this
     * rounding mode never decreases the magnitude of the calculated
     * value.
     */
    UP,
    /**
     * Rounding mode to round towards zero.  Never increments the digit
     * prior to a discarded fraction (i.e., truncates).  Note that this
     * rounding mode never increases the magnitude of the calculated value.
     * This mode corresponds to the IEEE 754-2019 rounding-direction
     * attribute "roundTowardZero".
     */
    DOWN,
    /**
     * Rounding mode to round towards positive infinity.  If the
     * result is positive, behaves as for `RoundingMode.UP`;
     * if negative, behaves as for `RoundingMode.DOWN`.  Note
     * that this rounding mode never decreases the calculated value.
     * This mode corresponds to the IEEE 754-2019 rounding-direction
     * attribute "roundTowardPositive".
     */
    CEILING,
    /**
     * Rounding mode to round towards negative infinity.  If the
     * result is positive, behave as for `RoundingMode.DOWN`;
     * if negative, behave as for `RoundingMode.UP`.  Note that
     * this rounding mode never increases the calculated value.
     * This mode corresponds to the IEEE 754-2019 rounding-direction
     * attribute "roundTowardNegative".
     */
    FLOOR,
    /**
     * Rounding mode to round towards "nearest neighbor"
     * unless both neighbors are equidistant, in which case round up.
     * Behaves as for `RoundingMode.UP` if the discarded
     * fraction is &ge; 0.5; otherwise, behaves as for
     * `RoundingMode.DOWN`.  Note that this is the rounding
     * mode commonly taught at school.
     * This mode corresponds to the IEEE 754-2019 rounding-direction
     * attribute "roundTiesToAway".
     */
    HALF_UP,
    /**
     * Rounding mode to round towards "nearest neighbor"
     * unless both neighbors are equidistant, in which case round
     * down.  Behaves as for `RoundingMode.UP` if the discarded
     * fraction is &gt; 0.5; otherwise, behaves as for
     * `RoundingMode.DOWN`.
     */
    HALF_DOWN,
    /**
     * Rounding mode to round towards the "nearest neighbor"
     * unless both neighbors are equidistant, in which case, round
     * towards the even neighbor.  Behaves as for
     * `RoundingMode.HALF_UP` if the digit to the left of the
     * discarded fraction is odd; behaves as for
     * `RoundingMode.HALF_DOWN` if it's even.  Note that this
     * is the rounding mode that statistically minimizes cumulative
     * error when applied repeatedly over a sequence of calculations.
     * It is sometimes known as "Banker's rounding," and is
     * chiefly used in the USA.
     * This mode corresponds to the IEEE 754-2019 rounding-direction
     * attribute "roundTiesToEven".
     */
    HALF_EVEN,
    /**
     * Rounding mode to assert that the requested operation has an exact
     * result, hence no rounding is necessary.  If this rounding mode is
     * specified on an operation that yields an inexact result, an
     * `RangeError` is thrown.
     */
    UNNECESSARY
}

/**
 * Immutable objects which encapsulate the context settings which
 * describe certain rules for numerical operators, such as those
 * implemented by the {@link BigDecimal} class.
 *
 * The base-independent settings are:
 *
 * * precision: the number of digits to be used for an operation; results are
 * rounded to this precision
 * * roundingMode: a {@link RoundingMode} object which specifies the algorithm to be
 * used for rounding.
 *
 * Sample Usage:
 * ```javascript
 * const { Big, MC, RoundingMode } = require('bigdecimal.js');
 *
 * const x = Big('1');
 * const y = Big('3');
 *
 * const res1 = x.divideWithMathContext(y, new MC(3));
 * console.log(res1.toString()); // 0.333
 *
 * // You can also use without `new` operator
 * const res2 = x.divideWithMathContext(y, MC(3, RoundingMode.UP));
 * console.log(res2.toString()); // 0.334
 *
 * try {
 *     x.divide(y);
 *     // throws since full precision is requested but it is not possible
 * } catch (e) {
 *     console.log(e); // RangeError: Non-terminating decimal expansion; no exact representable decimal result.
 * }
 * ```
 */
export class MathContext {
    /**
     * The number of digits to be used for an operation.  A value of 0
     * indicates that unlimited precision (as many digits as are
     * required) will be used.  Note that leading zeros (in the
     * coefficient of a number) are never significant.
     *
     * `precision` will always be non-negative.
     */
    readonly precision: number;
    /**
     * The rounding algorithm to be used for an operation. By default it is `HALF_UP`.
     *
     * see {@link RoundingMode}
     */
    readonly roundingMode: RoundingMode;

    constructor(precision: number, roundingMode: RoundingMode = MathContext.DEFAULT_ROUNDINGMODE) {
        if (precision < 0) {
            throw new RangeError('MathContext precision cannot be less than 0');
        } else if (!RoundingMode[roundingMode]) {
            throw new TypeError(`RoundingMode is invalid: ${roundingMode}`);
        }
        this.precision = precision;
        this.roundingMode = roundingMode;
    }

    /** @internal */
    private static DEFAULT_ROUNDINGMODE = RoundingMode.HALF_UP;
    /**
     * A `MathContext` object whose settings have the values
     * required for unlimited precision arithmetic.
     * The values of the settings are: `precision=0 roundingMode=HALF_UP`
     */
    static UNLIMITED = new MathContext(0, RoundingMode.HALF_UP);
    /**
     * A `MathContext` object with a precision setting
     * matching the precision of the IEEE 754-2019 decimal32 format, 7 digits, and a
     * rounding mode of {@link RoundingMode.HALF_EVEN |  HALF_EVEN}.
     * Note the exponent range of decimal32 is **not** used for
     * rounding.
     */
    static DECIMAL32 = new MathContext(7, RoundingMode.HALF_EVEN);
    /**
     * A `MathContext` object with a precision setting
     * matching the precision of the IEEE 754-2019 decimal64 format, 16 digits, and a
     * rounding mode of {@link RoundingMode.HALF_EVEN | HALF_EVEN}.
     * Note the exponent range of decimal64 is **not** used for
     * rounding.
     */
    static DECIMAL64 = new MathContext(16, RoundingMode.HALF_EVEN);
    /**
     * A `MathContext` object with a precision setting
     * matching the precision of the IEEE 754-2019 decimal128 format, 34 digits, and a
     * rounding mode of {@link RoundingMode.HALF_EVEN | HALF_EVEN}.
     * Note the exponent range of decimal64 is **not** used for
     * rounding.
     */
    static DECIMAL128 = new MathContext(34, RoundingMode.HALF_EVEN);
}

/**
 * [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) based BigDecimal
 * implementation. This class is ported from java.math.BigDecimal. The following documentation is adapted from openjdk/jdk
 * repository.
 *
 * Immutable, arbitrary-precision signed decimal numbers.  A
 * `BigDecimal` consists of an arbitrary precision number
 * {@link unscaledValue | unscaled value} and a {@link scale | scale}.
 * If zero or positive, the scale is the number of digits to the right of the decimal
 * point. If negative, the unscaled value of the number is multiplied
 * by ten to the power of the negation of the scale.  The value of the
 * number represented by the `BigDecimal` is therefore
 * <code>(unscaledValue &times; 10<sup>-scale</sup>)</code>.
 *
 * The `BigDecimal` class provides operations for
 * arithmetic, scale manipulation, rounding, comparison, hashing, and
 * format conversion.  The {@link toString} method provides a
 * canonical representation of a `BigDecimal`.
 *
 * The `BigDecimal` class gives its user complete control
 * over rounding behavior.  If no rounding mode is specified and the
 * exact result cannot be represented, a `RangeError`
 * is thrown; otherwise, calculations can be carried out to a chosen
 * precision and rounding mode by supplying an appropriate {@link
 * MathContext} object to the operation.  In either case, eight
 * <em>rounding modes</em> are provided for the control of rounding.
 *
 * When a `MathContext` object is supplied with a precision
 * setting of 0 (for example, {@link MathContext.UNLIMITED}),
 * arithmetic operations are exact, as are the arithmetic methods
 * which take no `MathContext` object. As a corollary of
 * computing the exact result, the rounding mode setting of a `
 * MathContext` object with a precision setting of 0 is not used and
 * thus irrelevant.  In the case of divide, the exact quotient could
 * have an infinitely long decimal expansion; for example, 1 divided
 * by 3.  If the quotient has a non-terminating decimal expansion and
 * the operation is specified to return an exact result, a RangeError
 * is thrown.  Otherwise, the exact result of the
 * division is returned, as done for other operations.
 *
 * When the precision setting is not 0, the rules of `BigDecimal`
 * arithmetic are broadly compatible with selected modes
 * of operation of the arithmetic defined in ANSI X3.274-1996 and ANSI
 * X3.274-1996/AM 1-2000 (section 7.4).  Unlike those standards,
 * `BigDecimal` includes many rounding modes.  Any conflicts
 * between these ANSI standards and the `BigDecimal`
 * specification are resolved in favor of `BigDecimal`.
 *
 * Since the same numerical value can have different
 * representations (with different scales), the rules of arithmetic
 * and rounding must specify both the numerical result and the scale
 * used in the result's representation.
 *
 * The different representations of the same numerical value are
 * called members of the same <i>cohort</i>. The {@link
 * compareTo |  natural order} of `BigDecimal`
 * considers members of the same cohort to be equal to each other. In
 * contrast, the {@link equals | equals} method requires both the
 * numerical value and representation to be the same for equality to
 * hold. The results of methods like {@link scale} and {@link
 * unscaledValue} will differ for numerically equal values with
 * different representations.
 *
 * In general the rounding modes and precision setting determine
 * how operations return results with a limited number of digits when
 * the exact result has more digits (perhaps infinitely many in the
 * case of division and square root) than the number of digits returned.
 *
 * First, the total number of digits to return is specified by the
 * `MathContext`'s `precision` setting; this determines
 * the result's <i>precision</i>.  The digit count starts from the
 * leftmost nonzero digit of the exact result.  The rounding mode
 * determines how any discarded trailing digits affect the returned
 * result.
 *
 * For all arithmetic operators, the operation is carried out as
 * though an exact intermediate result were first calculated and then
 * rounded to the number of digits specified by the precision setting
 * (if necessary), using the selected rounding mode.  If the exact
 * result is not returned, some digit positions of the exact result
 * are discarded.  When rounding increases the magnitude of the
 * returned result, it is possible for a new digit position to be
 * created by a carry propagating to a leading "9" digit.
 * For example, rounding the value 999.9 to three digits rounding up
 * would be numerically equal to one thousand, represented as
 * 100&times;10<sup>1</sup>.  In such cases, the new "1" is
 * the leading digit position of the returned result.
 *
 * For methods and constructors with a `MathContext`
 * parameter, if the result is inexact but the rounding mode is {@link
 * RoundingMode.UNNECESSARY | UNNECESSARY}, a RangeError will be thrown.
 *
 * Besides a logical exact result, each arithmetic operation has a
 * preferred scale for representing a result.  The preferred
 * scale for each operation is listed in the table below.
 *
 * <table class="striped" style="text-align:left">
 * <caption>Preferred Scales for Results of Arithmetic Operations
 * </caption>
 * <thead>
 * <tr><th scope="col">Operation</th><th scope="col">Preferred Scale of Result</th></tr>
 * </thead>
 * <tbody>
 * <tr><th scope="row">Add</th><td>max(addend.scale(), augend.scale())</td>
 * <tr><th scope="row">Subtract</th><td>max(minuend.scale(), subtrahend.scale())</td>
 * <tr><th scope="row">Multiply</th><td>multiplier.scale() + multiplicand.scale()</td>
 * <tr><th scope="row">Divide</th><td>dividend.scale() - divisor.scale()</td>
 * <tr><th scope="row">Square root</th><td>radicand.scale()/2</td>
 * </tbody>
 * </table>
 *
 * These scales are the ones used by the methods which return exact
 * arithmetic results; except that an exact divide may have to use a
 * larger scale since the exact result may have more digits.  For
 * example, `1/32` is `0.03125`.
 *
 * Before rounding, the scale of the logical exact intermediate
 * result is the preferred scale for that operation. If the exact
 * numerical result cannot be represented in `precision`
 * digits, rounding selects the set of digits to return and the scale
 * of the result is reduced from the scale of the intermediate result
 * to the least scale which can represent the `precision`
 * digits actually returned.  If the exact result can be represented
 * with at most `precision` digits, the representation
 * of the result with the scale closest to the preferred scale is
 * returned.  In particular, an exactly representable quotient may be
 * represented in fewer than `precision` digits by removing
 * trailing zeros and decreasing the scale.  For example, rounding to
 * three digits using the {@link RoundingMode.FLOOR | floor}
 * rounding mode, <br>
 *
 * `19/100 = 0.19   // number=19,  scale=2` <br>
 *
 * but<br>
 *
 * `21/110 = 0.190  // number=190, scale=3` <br>
 *
 * Note that for add, subtract, and multiply, the reduction in
 * scale will equal the number of digit positions of the exact result
 * which are discarded. If the rounding causes a carry propagation to
 * create a new high-order digit position, an additional digit of the
 * result is discarded than when no new digit position is created.
 *
 * Other methods may have slightly different rounding semantics.
 * For example, the result of the `pow` method using the
 * {@link pow | specified algorithm} can
 * occasionally differ from the rounded mathematical result by more
 * than one unit in the last place, one <i>{@link ulp}</i>.
 *
 * Two types of operations are provided for manipulating the scale
 * of a `BigDecimal`: scaling/rounding operations and decimal
 * point motion operations.  Scaling/rounding operations ({@link
 * setScale} and {@link round}) return a
 * `BigDecimal` whose value is approximately (or exactly) equal
 * to that of the operand, but whose scale or precision is the
 * specified value; that is, they increase or decrease the precision
 * of the stored number with minimal effect on its value.  Decimal
 * point motion operations ({@link movePointLeft} and
 * {@link movePointRight}) return a
 * `BigDecimal` created from the operand by moving the decimal
 * point a specified distance in the specified direction.
 *
 * As a number, the set of values for the scale is large,
 * but bounded. If the scale of a result would exceed the range of a
 * safe number, either by overflow or underflow, the operation may
 * throw a RangerError.
 *
 * For the sake of brevity and clarity, pseudo-code is used
 * throughout the descriptions of `BigDecimal` methods.  The
 * pseudo-code expression `(i + j)` is shorthand for "a
 * `BigDecimal` whose value is that of the `BigDecimal`
 * `i` added to that of the `BigDecimal`
 * `j`." The pseudo-code expression `(i == j)` is
 * shorthand for "`true` if and only if the
 * `BigDecimal` `i` represents the same value as the
 * `BigDecimal` `j`." Other pseudo-code expressions
 * are interpreted similarly.  Square brackets are used to represent
 * the particular `BigInt` and scale pair defining a
 * `BigDecimal` value; for example [19, 2] is the
 * `BigDecimal` numerically equal to 0.19 having a scale of 2.
 *
 * <h2>Relation to IEEE 754 Decimal Arithmetic</h2>
 *
 * Starting with its 2008 revision, the <cite>IEEE 754 Standard for
 * Floating-point Arithmetic</cite> has covered decimal formats and
 * operations. While there are broad similarities in the decimal
 * arithmetic defined by IEEE 754 and by this class, there are notable
 * differences as well. The fundamental similarity shared by
 * `BigDecimal` and IEEE 754 decimal arithmetic is the conceptual
 * operation of computing the mathematical infinitely precise real
 * number value of an operation and then mapping that real number to a
 * representable decimal floating-point value under a <em>rounding
 * policy</em>. The rounding policy is called a {@link
 * RoundingMode | rounding mode} for `BigDecimal` and called a
 * rounding-direction attribute in IEEE 754-2019. When the exact value
 * is not representable, the rounding policy determines which of the
 * two representable decimal values bracketing the exact value is
 * selected as the computed result. The notion of a <em>preferred
 * scale/preferred exponent</em> is also shared by both systems.
 *
 * For differences, IEEE 754 includes several kinds of values not
 * modeled by `BigDecimal` including negative zero, signed
 * infinities, and NaN (not-a-number). IEEE 754 defines formats, which
 * are parameterized by base (binary or decimal), number of digits of
 * precision, and exponent range. A format determines the set of
 * representable values. Most operations accept as input one or more
 * values of a given format and produce a result in the same format.
 * A `BigDecimal`'s {@link scale} is equivalent to
 * negating an IEEE 754 value's exponent. `BigDecimal` values do
 * not have a format in the same sense; all values have the same
 * possible range of scale/exponent and the {@link
 * unscaledValue | unscaled value} has arbitrary precision. Instead,
 * for the `BigDecimal` operations taking a `MathContext`
 * parameter, if the `MathContext` has a nonzero precision, the
 * set of possible representable values for the result is determined
 * by the precision of the `MathContext` argument. For example
 * in `BigDecimal`, if a nonzero three-digit number and a
 * nonzero four-digit number are multiplied together in the context of
 * a `MathContext` object having a precision of three, the
 * result will have three digits (assuming no overflow or underflow,
 * etc.).
 *
 * The rounding policies implemented by `BigDecimal`
 * operations indicated by {@link RoundingMode | rounding modes}
 * are a proper superset of the IEEE 754 rounding-direction
 * attributes.
 *
 * `BigDecimal` arithmetic will most resemble IEEE 754
 * decimal arithmetic if a `MathContext` corresponding to an
 * IEEE 754 decimal format, such as {@link MathContext.DECIMAL64 |
 * decimal64} or {@link MathContext.DECIMAL128 | decimal128} is
 * used to round all starting values and intermediate operations. The
 * numerical values computed can differ if the exponent range of the
 * IEEE 754 format being approximated is exceeded since a
 * `MathContext` does not constrain the scale of `BigDecimal`
 * results. Operations that would generate a NaN or exact infinity,
 * such as dividing by zero, throw a RangeError in
 * `BigDecimal` arithmetic.
 *
 */
export class BigDecimal {
    /** @internal */
    private static readonly zeroBigInt = BigInt(0);

    /** @internal */
    private static readonly oneBigInt = BigInt(1);

    /** @internal */
    private static readonly twoBigInt = BigInt(2);

    /** @internal */
    private static readonly minusOneBigInt = BigInt(-1);

    /** @internal */
    private readonly intVal: BigInt | null;

    /** @internal */
    private readonly _scale: number;

    /** @internal */
    private _precision: number;

    /** @internal */
    private stringCache: string | undefined;

    /** @internal */
    private readonly intCompact: number;

    /**
     * Sentinel value for {@link intCompact} indicating the
     * significand information is only available from intVal.
     * @internal
     */
    private static readonly INFLATED = Number.MIN_SAFE_INTEGER;
    /** @internal */
    private static readonly INFLATED_BIGINT = BigInt(BigDecimal.INFLATED);

    /** @internal */
    private static readonly MAX_INT_VALUE = 2147483647;
    /** @internal */
    private static readonly MIN_INT_VALUE = -2147483648;

    /** @internal */
    private static readonly MAX_COMPACT_DIGITS = 15;

    /** @internal */
    private static readonly ZERO_THROUGH_TEN = [
        new BigDecimal(BigDecimal.zeroBigInt, 0, 0, 1),
        new BigDecimal(BigDecimal.oneBigInt, 1, 0, 1),
        new BigDecimal(BigDecimal.twoBigInt, 2, 0, 1),
        new BigDecimal(BigInt(3), 3, 0, 1),
        new BigDecimal(BigInt(4), 4, 0, 1),
        new BigDecimal(BigInt(5), 5, 0, 1),
        new BigDecimal(BigInt(6), 6, 0, 1),
        new BigDecimal(BigInt(7), 7, 0, 1),
        new BigDecimal(BigInt(8), 8, 0, 1),
        new BigDecimal(BigInt(9), 9, 0, 1),
        new BigDecimal(BigInt(10), 10, 0, 2),
    ];

    /** @internal */
    private static readonly ZERO = BigDecimal.ZERO_THROUGH_TEN[0];
    /** @internal */
    private static readonly ONE = BigDecimal.ZERO_THROUGH_TEN[1];

    /** @internal */
    private static readonly ZERO_SCALED_BY = [
        BigDecimal.ZERO_THROUGH_TEN[0],
        new BigDecimal(BigDecimal.zeroBigInt, 0, 1, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 2, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 3, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 4, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 5, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 6, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 7, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 8, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 9, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 10, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 11, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 12, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 13, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 14, 1),
        new BigDecimal(BigDecimal.zeroBigInt, 0, 15, 1),
    ];

    /** @internal */
    private static readonly TEN_POWERS_TABLE = [
        1,
        10,
        100,
        1000,
        10000,
        100000,
        1000000,
        10000000,
        100000000,
        1000000000,
        10000000000,
        100000000000,
        1000000000000,
        10000000000000,
        100000000000000,
        1000000000000000,
    ];

    /** @internal */
    private static readonly HALF_NUMBER_MAX_VALUE = Number.MAX_SAFE_INTEGER / 2;
    /** @internal */
    private static readonly HALF_NUMBER_MIN_VALUE = Number.MIN_SAFE_INTEGER / 2;

    /** @internal */
    private static readonly ONE_TENTH = BigDecimal.fromInteger3(1, 1);
    /** @internal */
    private static readonly ONE_HALF = BigDecimal.fromInteger3(5, 1);
    /** @internal */
    private static NUMBER_10_POW = [
        1e0, 1e1, 1e2, 1e3, 1e4, 1e5,
        1e6, 1e7, 1e8, 1e9, 1e10, 1e11,
        1e12, 1e13, 1e14, 1e15
    ];

    /** @internal */
    private static THRESHOLDS_TABLE = [
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER / 10,
        Number.MAX_SAFE_INTEGER / 100,
        Number.MAX_SAFE_INTEGER / 1000,
        Number.MAX_SAFE_INTEGER / 10000,
        Number.MAX_SAFE_INTEGER / 100000,
        Number.MAX_SAFE_INTEGER / 1000000,
        Number.MAX_SAFE_INTEGER / 10000000,
        Number.MAX_SAFE_INTEGER / 100000000,
        Number.MAX_SAFE_INTEGER / 1000000000,
        Number.MAX_SAFE_INTEGER / 10000000000,
        Number.MAX_SAFE_INTEGER / 100000000000,
        Number.MAX_SAFE_INTEGER / 1000000000000,
        Number.MAX_SAFE_INTEGER / 10000000000000,
        Number.MAX_SAFE_INTEGER / 100000000000000,
        Number.MAX_SAFE_INTEGER / 1000000000000000,
    ];
    /** @internal */
    private static readonly DIGIT_TENS = [
        '0', '0', '0', '0', '0', '0', '0', '0', '0', '0',
        '1', '1', '1', '1', '1', '1', '1', '1', '1', '1',
        '2', '2', '2', '2', '2', '2', '2', '2', '2', '2',
        '3', '3', '3', '3', '3', '3', '3', '3', '3', '3',
        '4', '4', '4', '4', '4', '4', '4', '4', '4', '4',
        '5', '5', '5', '5', '5', '5', '5', '5', '5', '5',
        '6', '6', '6', '6', '6', '6', '6', '6', '6', '6',
        '7', '7', '7', '7', '7', '7', '7', '7', '7', '7',
        '8', '8', '8', '8', '8', '8', '8', '8', '8', '8',
        '9', '9', '9', '9', '9', '9', '9', '9', '9', '9',
    ];
    /** @internal */
    private static readonly DIGIT_ONES = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ];

    /** @internal */
    private static adjustScale(scl: number, exp: number): number {
        const adjustedScale = scl - exp;
        if (adjustedScale > BigDecimal.MAX_INT_VALUE || adjustedScale < BigDecimal.MIN_INT_VALUE)
            throw new RangeError('Scale out of range.');
        scl = adjustedScale;
        return scl;
    }

    /** @internal */
    private constructor(bigIntValue: BigInt | null, intCompact: number, scale: number, precision: number) {
        this.intVal = bigIntValue;
        this._scale = scale;
        this._precision = precision;
        this.intCompact = intCompact;
    }

    /**
     * Translates a character array representation of a
     * `BigDecimal` into a `BigDecimal`.
     *
     * @param input input string
     * @param offset first character in the string to inspect.
     * @param len number of characters to consider.
     * @param mc the context to use.
     * @throws RangeError if `input` is not a valid
     * representation of a `BigDecimal` or the defined subarray
     * is not wholly within `input`.
     * @internal
     */
    private static fromString(
        input: string,
        offset: number,
        len: number,
        mc: MathContext = MathContext.UNLIMITED
    ): BigDecimal {
        // This is the primary string to BigDecimal constructor

        // Use locals for all fields values until completion
        let prec = 0; // record precision value
        let scl = 0; // record scale value
        let rs = 0; // the compact value in long
        let rb: BigInt | null = null; // the inflated value in BigInt

        // use array bounds checking to handle too-long, len == 0,
        // bad offset, etc.
        // handle the sign
        let isneg = false; // assume positive
        if (input[offset] === '-') {
            isneg = true; // leading minus means negative
            offset++;
            len--;
        } else if (input[offset] === '+') { // leading + allowed
            offset++;
            len--;
        }

        // should now be at numeric part of the significand
        let dot = false; // true when there is a '.'
        let exp = 0; // exponent
        let c: string; // current character
        const isCompact = len <= this.MAX_COMPACT_DIGITS;

        // integer significand array & idx is the index to it. The array
        // is ONLY used when we can't use a compact representation.
        let idx = 0;
        if (isCompact) {
            // First compact case, we need not to preserve the character
            // and we can just compute the value in place.
            for (; len > 0; offset++, len--) {
                c = input[offset];
                if ((c === '0')) { // have zero
                    if (prec === 0)
                        prec = 1;
                    else if (rs !== 0) {
                        rs *= 10;
                        ++prec;
                    } // else digit is a redundant leading zero
                    if (dot)
                        ++scl;
                } else if ((c >= '1' && c <= '9')) { // have digit
                    const digit = +c;
                    if (prec !== 1 || rs !== 0)
                        ++prec; // prec unchanged if preceded by 0s
                    rs = rs * 10 + digit;
                    if (dot)
                        ++scl;
                } else if (c === '.') { // have dot
                    if (dot) // two dots
                        throw new RangeError('Character array contains more than one decimal point.');
                    dot = true;
                } else if ((c === 'e') || (c === 'E')) {
                    exp = BigDecimal.parseExp(input, offset, len);

                    // Next test is required for backwards compatibility
                    if (exp > BigDecimal.MAX_INT_VALUE || exp < BigDecimal.MIN_INT_VALUE) // overflow
                        throw new RangeError('Exponent overflow.');
                    break; // [saves a test]
                } else {
                    throw new RangeError('Character ' + c
                        + ' is neither a decimal digit number, decimal point, nor'
                        + ' "e" notation exponential mark.');
                }
            }
            if (prec === 0) // no digits found
                throw new RangeError('No digits found.');

            // Adjust scale if exp is not zero.
            if (exp !== 0) { // had significant exponent
                scl = BigDecimal.adjustScale(scl, exp);
            }
            rs = isneg ? -rs : rs;
            const mcp = mc.precision;
            let drop = prec - mcp; // prec has range [1, MAX_INT], mcp has range [0, MAX_INT];
            // therefore, this subtract cannot overflow
            if (mcp > 0 && drop > 0) { // do rounding
                while (drop > 0) {
                    scl = BigDecimal.checkScaleNonZero(scl - drop);
                    rs = BigDecimal.divideAndRound(rs, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.integerDigitLength(rs);
                    drop = prec - mcp;
                }
            }
        } else {
            const coeff = [];
            for (; len > 0; offset++, len--) {
                c = input[offset];
                // have digit
                if (c >= '0' && c <= '9') {
                    // First compact case, we need not to preserve the character
                    // and we can just compute the value in place.
                    if (c === '0') {
                        if (prec === 0) {
                            coeff[idx] = c;
                            prec = 1;
                        } else if (idx !== 0) {
                            coeff[idx++] = c;
                            prec++;
                        } // else c must be a redundant leading zero
                    } else {
                        if (prec !== 1 || idx !== 0) prec++; // prec unchanged if preceded by 0s
                        coeff[idx++] = c;
                    }
                    if (dot) scl++;
                    continue;
                }
                // have dot
                if (c === '.') {
                    if (dot) { // two dots
                        throw new RangeError('String contains more than one decimal point.');
                    }
                    dot = true;
                    continue;
                }
                // exponent expected
                if ((c !== 'e') && (c !== 'E')) {
                    throw new RangeError('String is missing "e" notation exponential mark.');
                }
                exp = BigDecimal.parseExp(input, offset, len);
                // Next test is required for backwards compatibility
                if (exp > BigDecimal.MAX_INT_VALUE || exp < BigDecimal.MIN_INT_VALUE) // overflow
                    throw new RangeError('Exponent overflow.');
                break; // [saves a test]
            }
            // here when no characters left
            if (prec === 0) { // no digits found
                throw new RangeError('No digits found.');
            }
            // Adjust scale if exp is not zero.
            if (exp !== 0) { // had significant exponent
                scl = BigDecimal.adjustScale(scl, exp);
            }
            const stringValue = coeff.join('');
            // Remove leading zeros from precision (digits count)
            if (isneg) rb = BigInt('-' + stringValue);
            else rb = BigInt(stringValue);
            rs = BigDecimal.compactValFor(rb);
            const mcp = mc.precision;
            if (mcp > 0 && (prec > mcp)) {
                if (rs === BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop > 0) {
                        scl = BigDecimal.checkScaleNonZero(scl - drop);
                        rb = BigDecimal.divideAndRoundByTenPow(rb, drop, mc.roundingMode);
                        rs = BigDecimal.compactValFor(rb);
                        if (rs !== BigDecimal.INFLATED) {
                            prec = BigDecimal.integerDigitLength(rs);
                            break;
                        }
                        prec = BigDecimal.bigDigitLength(rb);
                        drop = prec - mcp;
                    }
                }
                if (rs !== BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop > 0) {
                        scl = BigDecimal.checkScaleNonZero(scl - drop);
                        rs = BigDecimal.divideAndRound(rs, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                        prec = BigDecimal.integerDigitLength(rs);
                        drop = prec - mcp;
                    }
                    rb = null;
                }
            }
        }
        return new BigDecimal(rb, rs, scl, prec);
    }

    /** @internal */
    private static fromBigInt(value: BigInt, scale?: number, mc?: MathContext): BigDecimal {
        if (scale === undefined) {
            if (mc === undefined) {
                return BigDecimal.fromBigInt3(value);
            } else {
                return BigDecimal.fromBigInt2(value, 0, mc);
            }
        } else {
            if (mc === undefined) {
                return BigDecimal.fromBigInt4(value, scale);
            } else {
                return BigDecimal.fromBigInt2(value, scale, mc);
            }
        }
    }

    /**
     * Translates a `BigInt` unscaled value and a number
     * scale into a `BigDecimal`, with rounding
     * according to the context settings.  The value of the
     * `BigDecimal` is <code>(unscaledVal &times;
     * 10<sup>-scale</sup>)</code>, rounded according to the
     * `precision` and rounding mode settings.
     *
     * @param intVal unscaled value of the `BigDecimal`.
     * @param scale       scale of the `BigDecimal`.
     * @param mc          the context to use.
     * @internal
     */
    private static fromBigInt2(intVal: BigInt, scale: number, mc: MathContext): BigDecimal {
        let unscaledVal: BigInt | null = intVal;
        let compactVal = BigDecimal.compactValFor(unscaledVal);
        const mcp = mc.precision;
        let prec = 0;
        if (mcp > 0) { // do rounding
            const mode = mc.roundingMode;
            if (compactVal === BigDecimal.INFLATED) {
                prec = BigDecimal.bigDigitLength(unscaledVal);
                let drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    unscaledVal = BigDecimal.divideAndRoundByTenPow(unscaledVal, drop, mode);
                    compactVal = BigDecimal.compactValFor(unscaledVal);
                    if (compactVal !== BigDecimal.INFLATED) {
                        break;
                    }
                    prec = BigDecimal.bigDigitLength(unscaledVal);
                    drop = prec - mcp;
                }
            }
            if (compactVal !== BigDecimal.INFLATED) {
                prec = BigDecimal.integerDigitLength(compactVal);
                let drop = prec - mcp; // drop can't be more than 15
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mode);
                    prec = BigDecimal.integerDigitLength(compactVal);
                    drop = prec - mcp;
                }
                unscaledVal = null;
            }
        }
        return new BigDecimal(unscaledVal, compactVal, scale, prec);
    }

    /**
     * Translates a {@code BigInteger} into a `BigDecimal`.
     * The scale of the `BigDecimal` is zero.
     *
     * @param intVal `BigInt` value to be converted to
     *            `BigDecimal`.
     * @internal
     */
    private static fromBigInt3(intVal: BigInt): BigDecimal {
        const intCompact = BigDecimal.compactValFor(intVal);
        return new BigDecimal(intVal, intCompact, 0, 0);
    }

    /**
     * Translates a `BigInt` unscaled value and a number
     * scale into a `BigDecimal`.  The value of
     * the `BigDecimal` is
     * <code>(unscaledVal &times; 10<sup>-scale</sup>)</code>.
     *
     * @param intVal unscaled value of the `BigDecimal`.
     * @param scale       scale of the `BigDecimal`.
     * @internal
     */
    private static fromBigInt4(intVal: BigInt, scale: number): BigDecimal {
        // Negative scales are now allowed
        const intCompact = BigDecimal.compactValFor(intVal);
        return new BigDecimal(intVal, intCompact, scale, 0);
    }

    /** @internal */
    private static fromBigInt5(intVal: BigInt, scale: number, prec: number): BigDecimal {
        const intCompact = BigDecimal.compactValFor(intVal);
        if (intCompact === 0) {
            return BigDecimal.zeroValueOf(scale);
        } else if (scale === 0 && intCompact >= 0 && intCompact < BigDecimal.ZERO_THROUGH_TEN.length) {
            return BigDecimal.ZERO_THROUGH_TEN[intCompact];
        }
        return new BigDecimal(intVal, intCompact, scale, prec);
    }

    /**
     * Translates a `double` into a `BigDecimal`, using
     * the `double`'s canonical string representation provided
     * by the String constructor.
     *
     * @param double `double` to convert to a `BigDecimal`.
     * @param mc math context to use
     * @return a `BigDecimal` whose value is equal to or approximately
     * equal to the value of `double`.
     * @throws RangeError if `double` is not a valid `BigDecimal`
     * @internal
     */
    private static fromDouble(double: number, mc?: MathContext): BigDecimal {
        const strValue = String(double);
        return BigDecimal.fromString(strValue, 0, strValue.length, mc);
    }

    /**
     * Construct a new BigDecimal from a number with given scale and precision
     * @param value integer value
     * @param scale scale value
     * @param mc math context value
     * @internal
     */
    private static fromInteger(value: number, scale?: number, mc?: MathContext): BigDecimal {
        if (mc !== undefined) {
            return BigDecimal.fromNumber5(value, mc);
        } else {
            if (scale !== undefined) {
                return BigDecimal.fromInteger3(value, scale);
            } else {
                return BigDecimal.fromInteger4(value);
            }
        }
    }

    /** @internal */
    private static fromInteger2(value: number, scale: number, prec: number): BigDecimal {
        if (scale === 0 && value >= 0 && value < BigDecimal.ZERO_THROUGH_TEN.length) {
            return BigDecimal.ZERO_THROUGH_TEN[value];
        } else if (value === 0) {
            return BigDecimal.zeroValueOf(scale);
        }

        return new BigDecimal(value === BigDecimal.INFLATED ? BigDecimal.INFLATED_BIGINT : null, value, scale, prec);
    }

    /**
     * Translates a `number` unscaled value and a `number`
     * scale into a `BigDecimal`.
     *
     * @param value unscaled value of the `BigDecimal`.
     * @param scale       scale of the `BigDecimal`.
     * @return a `BigDecimal` whose value is
     * <code>(unscaledVal &times; 10<sup>-scale</sup>)</code>.
     * @internal
     */
    private static fromInteger3(value: number, scale: number): BigDecimal {
        if (scale === 0) {
            return BigDecimal.fromInteger4(value);
        } else if (value === 0) {
            return BigDecimal.zeroValueOf(scale);
        }

        return new BigDecimal(value === BigDecimal.INFLATED ? BigDecimal.INFLATED_BIGINT : null, value, scale, 0);
    }

    /**
     * Translates an integer value into a `BigDecimal`
     * with a scale of zero.
     *
     * @param value value of the `BigDecimal`.
     * @return a `BigDecimal` whose value is `value`.
     * @internal
     */
    private static fromInteger4(value: number): BigDecimal {
        if (this.ZERO_THROUGH_TEN[value]) {
            return this.ZERO_THROUGH_TEN[value];
        } else if (value !== BigDecimal.INFLATED) {
            return new BigDecimal(null, value, 0, 0);
        } else {
            return new BigDecimal(this.INFLATED_BIGINT, value, 0, 0);
        }
    }

    /**
     * Translates an integer into a `BigDecimal`, with
     * rounding according to the context settings.  The scale of the
     * `BigDecimal`, before any rounding, is zero.
     *
     * @param value number value to be converted to `BigDecimal`.
     * @param mc  the context to use.
     * @internal
     */
    private static fromNumber5(value: number, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        const mode = mc.roundingMode;
        let prec = 0;
        let scl = 0;
        let rb: BigInt | null = (value === BigDecimal.INFLATED) ? BigDecimal.INFLATED_BIGINT : null;
        if (mcp > 0) { // do rounding
            if (value === BigDecimal.INFLATED) {
                prec = 16; // number max digits + 1
                let drop = prec - mcp;
                while (drop > 0) {
                    scl = BigDecimal.checkScaleNonZero(scl - drop);
                    rb = BigDecimal.divideAndRoundByTenPow(rb!, drop, mode);
                    value = BigDecimal.compactValFor(rb);
                    if (value !== BigDecimal.INFLATED) {
                        break;
                    }
                    prec = BigDecimal.bigDigitLength(rb);
                    drop = prec - mcp;
                }
            }
            if (value !== BigDecimal.INFLATED) {
                prec = BigDecimal.integerDigitLength(value);
                let drop = prec - mcp;
                while (drop > 0) {
                    scl = BigDecimal.checkScaleNonZero(scl - drop);
                    value = BigDecimal.divideAndRound(value, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.integerDigitLength(value);
                    drop = prec - mcp;
                }
                rb = null;
            }
        }
        return new BigDecimal(rb, value, scl, prec);
    }

    /**
     * Returns number of digits in a integer
     * @param value integer value
     * @internal
     */
    private static integerDigitLength(value: number): number {
        let length = 0;
        let n = Math.abs(value);

        do {
            n /= 10;
            length++;
        } while (n >= 1);
        return length;
    }

    /**
     * parse exponent
     * @internal
     */
    private static parseExp(input: string, offset: number, len: number): number {
        let exp = 0;
        offset++;
        let c = input[offset];
        len--;
        const negexp = (c === '-');
        // optional sign
        if (negexp || c === '+') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len <= 0) { // no exponent digits
            throw new RangeError('No exponent digits');
        }
        // skip leading zeros in the exponent
        while (len > 10 && c === '0') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len > 10) { // too many nonzero exponent digits
            throw new RangeError('Too many nonzero exponent digits');
        }
        // c now holds first digit of exponent
        for (; ; len--) {
            let v: number;
            if (c >= '0' && c <= '9') {
                v = +c;
            } else {
                // not a digit
                throw new RangeError('Not a digit.');
            }
            exp = exp * 10 + v;
            if (len === 1)
                break; // that was final character
            offset++;
            c = input[offset];
        }
        if (negexp) // apply sign
            exp = -exp;
        return exp;
    }

    /** @internal */
    static fromValue(value: any, scale?: number, mc?: MathContext): BigDecimal {
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

                return BigDecimal.fromDouble(value, mc);
            }
            if (!(value > Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)) {
                // Unsafe range, build from bigint
                return BigDecimal.fromBigInt(BigInt(value), scale, mc);
            }
            return BigDecimal.fromInteger(value, scale, mc);
        }
        if (typeof value === 'bigint') {
            return BigDecimal.fromBigInt(value, scale, mc);
        }
        if (value instanceof BigDecimal) {
            return new BigDecimal(value.intVal, value.intCompact, value.scale(), value._precision);
        }
        if (scale !== undefined) {
            throw new RangeError('You should give scale only with BigInts or integers');
        }
        value = String(value);
        return BigDecimal.fromString(value, 0, value.length, mc);
    }

    /**
     * Converts a value to BigDecimal if it is not already.
     * @param value
     * @internal
     */
    private static convertToBigDecimal(value: any): BigDecimal {
        if (value instanceof BigDecimal) return value;
        return BigDecimal.fromValue(value);
    }

    /** @internal */
    private static add1(fst: BigInt, scale1: number, snd: BigInt, scale2: number) {
        let rscale = scale1;
        const sdiff = rscale - scale2;
        if (sdiff !== 0) {
            if (sdiff < 0) {
                const raise = this.checkScale3(fst, -sdiff);
                rscale = scale2;
                fst = BigDecimal.bigMultiplyPowerTen3(fst!, raise);
            } else {
                const raise = this.checkScale3(snd, sdiff);
                snd = BigDecimal.bigMultiplyPowerTen3(snd!, raise);
            }
        }
        const sum = fst!.valueOf() + snd!.valueOf();
        const sameSignum = (fst! === BigDecimal.zeroBigInt && snd! === BigDecimal.zeroBigInt) ||
            (fst! > BigDecimal.zeroBigInt && snd! > BigDecimal.zeroBigInt) ||
            (fst! < BigDecimal.zeroBigInt && snd! < BigDecimal.zeroBigInt);
        return sameSignum ? new BigDecimal(sum, BigDecimal.INFLATED, rscale, 0) : BigDecimal.fromBigInt5(sum, rscale, 0);
    }

    /** @internal */
    private static add2(xs: number, scale1: number, snd: BigInt, scale2: number) {
        let rscale = scale1;
        const sdiff = rscale - scale2;
        const sameSigns = (snd! === BigDecimal.zeroBigInt && xs === 0) ||
            (snd! > BigDecimal.zeroBigInt && xs > 0) ||
            (snd! < BigDecimal.zeroBigInt && xs < 0);
        let sum;
        if (sdiff < 0) {
            const raise = this.checkScale2(xs, -sdiff);
            rscale = scale2;
            const scaledX = BigDecimal.integerMultiplyPowerTen(xs, raise);
            if (scaledX === BigDecimal.INFLATED) {
                sum = snd!.valueOf() + BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf();
            } else {
                sum = snd!.valueOf() + BigInt(scaledX).valueOf();
            }
        } else { // if (sdiff > 0) {
            const raise = this.checkScale3(snd, sdiff);
            snd = BigDecimal.bigMultiplyPowerTen3(snd, raise);
            sum = snd!.valueOf() + BigInt(xs);
        }
        return (sameSigns) ?
            new BigDecimal(sum, BigDecimal.INFLATED, rscale, 0) : BigDecimal.fromBigInt5(sum, rscale, 0);
    }

    /** @internal */
    private static add3(xs: number, scale1: number, ys: number, scale2: number) {
        const sdiff = scale1 - scale2;
        if (sdiff === 0) {
            return BigDecimal.add4(xs, ys, scale1);
        } else if (sdiff < 0) {
            const raise = this.checkScale2(xs, -sdiff);
            const scaledX = BigDecimal.integerMultiplyPowerTen(xs, raise);
            if (scaledX !== BigDecimal.INFLATED) {
                return BigDecimal.add4(scaledX, ys, scale2);
            } else {
                const bigsum = BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ?
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale2, 0) : BigDecimal.fromBigInt5(bigsum, scale2, 0);
            }
        } else {
            const raise = this.checkScale2(ys, sdiff);
            const scaledY = BigDecimal.integerMultiplyPowerTen(ys, raise);
            if (scaledY !== BigDecimal.INFLATED) {
                return BigDecimal.add4(xs, scaledY, scale1);
            } else {
                const bigsum = BigDecimal.bigMultiplyPowerTen2(ys, raise).valueOf() + BigInt(xs).valueOf();
                return ((xs ^ ys) >= 0) ?
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale1, 0) : BigDecimal.fromBigInt5(bigsum, scale1, 0);
            }
        }
    }

    /** @internal */
    private static add4(xs: number, ys: number, scale: number): BigDecimal {
        const sum = BigDecimal.add5(xs, ys);
        if (sum !== BigDecimal.INFLATED)
            return BigDecimal.fromInteger3(sum, scale);
        return BigDecimal.fromBigInt5(BigInt(xs) + BigInt(ys), scale, 0);
    }

    /**
     * returns INFLATED if overflows
     * @internal
     */
    private static add5(xs: number, ys: number): number {
        const sum = xs + ys;
        if (sum >= Number.MAX_SAFE_INTEGER)
            return BigDecimal.INFLATED;
        return sum;
    }

    /**
     * Compute val * 10 ^ n; return this product if it is
     * representable as a long, INFLATED otherwise.
     * @internal
     */
    private static integerMultiplyPowerTen(val: number, n: number): number {
        if (val === 0 || n <= 0)
            return val;
        const tab = BigDecimal.TEN_POWERS_TABLE;
        const bounds = BigDecimal.THRESHOLDS_TABLE;
        if (n < tab.length && n < bounds.length) {
            const tenpower = tab[n];
            if (val === 1)
                return tenpower;
            if (Math.abs(val) <= bounds[n])
                return val * tenpower;
        }
        return BigDecimal.INFLATED;
    }

    /**
     * Returns the signum function of this `BigDecimal`.
     *
     * @return -1, 0, or 1 as the value of this `BigDecimal`
     *         is negative, zero, or positive.
     */
    signum(): number {
        const intCompactSignum = this.intCompact > 0 ? 1 : (this.intCompact < 0 ? -1 : 0);
        const intValSignum = BigDecimal.bigIntSignum(this.intVal!);
        return this.intCompact !== BigDecimal.INFLATED ? intCompactSignum : intValSignum;
    }

    /**
     * Returns unscaled value of this `BigDecimal` as `BigInt`
     * @internal
     */
    private inflated(): BigInt {
        return this.intVal === null ? BigInt(this.intCompact) : this.intVal;
    }

    /**
     * Returns the compact value for given `BigInt`, or
     * INFLATED if too big. Relies on internal representation of
     * `BigInt`.
     * @internal
     */
    private static compactValFor(value: BigInt): number {
        if (value.valueOf() > Number.MAX_SAFE_INTEGER || value.valueOf() < Number.MIN_SAFE_INTEGER) {
            return BigDecimal.INFLATED;
        }
        return Number(value);
    }

    /** @internal */
    private checkScale(val: number): number {
        if (val > BigDecimal.MAX_INT_VALUE || val < BigDecimal.MIN_INT_VALUE) {
            val = val > BigDecimal.MAX_INT_VALUE ? BigDecimal.MAX_INT_VALUE : BigDecimal.MIN_INT_VALUE;
            if (this.intCompact !== 0 && (this.intVal === null || BigDecimal.bigIntSignum(this.intVal) !== 0))
                throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
        }
        return val;
    }

    /** @internal */
    private static checkScale2(intCompact: number, val: number): number {
        if (val > BigDecimal.MAX_INT_VALUE || val < BigDecimal.MIN_INT_VALUE) {
            val = (val > BigDecimal.MAX_INT_VALUE) ? BigDecimal.MAX_INT_VALUE : BigDecimal.MIN_INT_VALUE;
            if (intCompact !== 0) {
                throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
            }
        }
        return val;
    }

    /** @internal */
    private static checkScale3(intVal: BigInt, val: number) {
        if (val > BigDecimal.MAX_INT_VALUE || val < BigDecimal.MIN_INT_VALUE) {
            val = (val > BigDecimal.MAX_INT_VALUE) ? BigDecimal.MAX_INT_VALUE : BigDecimal.MIN_INT_VALUE;
            if (intVal !== BigDecimal.zeroBigInt) {
                throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
            }
        }
        return val;
    }

    /**
     * the same as checkScale where value!=0
     * @internal
     */
    private static checkScaleNonZero(val: number) {
        if (val > BigDecimal.MAX_INT_VALUE || val < BigDecimal.MIN_INT_VALUE) {
            throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
        }
        return val;
    }

    /**
     * Divides `BigInt` value by ten power.
     * @internal
     */
    private static divideAndRoundByTenPow(intVal: BigInt, tenPow: number, roundingMode: number): BigInt {
        if (tenPow < BigDecimal.TEN_POWERS_TABLE.length)
            intVal = BigDecimal.divideAndRound5(intVal, BigDecimal.TEN_POWERS_TABLE[tenPow], roundingMode);
        else
            intVal = BigDecimal.divideAndRound6(intVal, BigInt(10) ** BigInt(tenPow), roundingMode);
        return intVal;
    }

    /**
     * Divides `number by `number and do rounding based on the
     * passed in roundingMode.
     * @internal
     */
    private static divideAndRound(ldividend: number, ldivisor: number, roundingMode: number): number {
        const q = Math.trunc(ldividend / ldivisor);
        if (roundingMode === RoundingMode.DOWN)
            return q;
        const r = ldividend % ldivisor;
        const qsign = ((ldividend < 0) === (ldivisor < 0)) ? 1 : -1;
        if (r !== 0) {
            const increment = BigDecimal.needIncrement(ldivisor, roundingMode, qsign, q, r);
            return increment ? q + qsign : q;
        } else {
            return q;
        }
    }

    /**
     * Compute this * 10 ^ n.
     * Needed mainly to allow special casing to trap zero value
     * @internal
     */
    private bigMultiplyPowerTen(n: number): BigInt {
        if (n <= 0)
            return this.inflated();
        if (this.intCompact !== BigDecimal.INFLATED)
            return BigInt(10) ** BigInt(n) * BigInt(this.intCompact);
        else
            return this.intVal!.valueOf() * BigInt(10) ** BigInt(n);
    }

    /** @internal */
    private static bigMultiplyPowerTen2(value: number, n: number): BigInt {
        if (n <= 0) return BigInt(value);
        return BigInt(10) ** BigInt(n) * BigInt(value);
    }

    /** @internal */
    private static bigMultiplyPowerTen3(value: BigInt, n: any): BigInt {
        if (n <= 0) return value;
        if (n < BigDecimal.TEN_POWERS_TABLE.length) {
            return value!.valueOf() * BigInt(BigDecimal.TEN_POWERS_TABLE[n]);
        }
        return BigInt(10) ** BigInt(n) * value.valueOf();
    }

    /** @internal */
    private static zeroValueOf(scale: number): BigDecimal {
        if (scale >= 0 && scale < BigDecimal.ZERO_SCALED_BY.length)
            return BigDecimal.ZERO_SCALED_BY[scale];
        else
            return new BigDecimal(BigDecimal.zeroBigInt, 0, scale, 1);
    }

    public precision(): number {
        let result = this._precision;
        if (result === 0) {
            const s = this.intCompact;
            if (s !== BigDecimal.INFLATED)
                result = BigDecimal.integerDigitLength(s);
            else
                result = BigDecimal.bigDigitLength(this.intVal!);
            this._precision = result;
        }
        return result;
    }

    /**
     * Returns a `BigDecimal` rounded according to the MathContext
     * settings;
     * If rounding is needed a new `BigDecimal` is created and returned.
     *
     * @param val the value to be rounded
     * @param mc  the context to use.
     * @return a `BigDecimal` rounded according to the MathContext
     * settings.  May return `value`, if no rounding needed.
     * @throws RangeError if the rounding mode is
     *                             `RoundingMode.UNNECESSARY` and the
     *                             result is inexact.
     * @internal
     */
    private static doRound(val: BigDecimal, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        let wasDivided = false;
        if (mcp > 0) {
            let intVal = val.intVal;
            let compactVal = val.intCompact;
            let scale = val._scale;
            let prec = val.precision();
            const mode = mc.roundingMode;
            let drop;
            if (compactVal === BigDecimal.INFLATED) {
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    intVal = BigDecimal.divideAndRoundByTenPow(intVal!, drop, mode);
                    wasDivided = true;
                    compactVal = BigDecimal.compactValFor(intVal);
                    if (compactVal !== BigDecimal.INFLATED) {
                        prec = BigDecimal.integerDigitLength(compactVal);
                        break;
                    }
                    prec = BigDecimal.bigDigitLength(intVal!);
                    drop = prec - mcp;
                }
            }
            if (compactVal !== BigDecimal.INFLATED) {
                drop = prec - mcp; // drop can't be more than 15
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    wasDivided = true;
                    prec = BigDecimal.integerDigitLength(compactVal);
                    drop = prec - mcp;
                    intVal = null;
                }
            }
            return wasDivided ? new BigDecimal(intVal, compactVal, scale, prec) : val;
        }
        return val;
    }

    /**
     * Returns length of a bigint
     * @internal
     */
    private static bigDigitLength(b: BigInt) {
        if (b < BigDecimal.zeroBigInt) b = b.valueOf() * BigDecimal.minusOneBigInt;
        return b.toString().length;
    }

    /**
     * Returns a `BigDecimal` created from `BigInt` value with
     * given scale rounded according to the MathContext settings
     * @internal
     */
    private static doRound2(intVal: BigInt, scale: number, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        let prec = 0;
        if (mcp > 0) {
            let compactVal = BigDecimal.compactValFor(intVal);
            const mode = mc.roundingMode;
            let drop;
            if (compactVal === BigDecimal.INFLATED) {
                prec = BigDecimal.bigDigitLength(intVal);
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    intVal = BigDecimal.divideAndRoundByTenPow(intVal, drop, mode);
                    compactVal = BigDecimal.compactValFor(intVal);
                    if (compactVal !== BigDecimal.INFLATED) {
                        break;
                    }
                    prec = BigDecimal.bigDigitLength(intVal);
                    drop = prec - mcp;
                }
            }
            if (compactVal !== BigDecimal.INFLATED) {
                prec = BigDecimal.integerDigitLength(compactVal);
                drop = prec - mcp; // drop can't be more than 18
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.integerDigitLength(compactVal);
                    drop = prec - mcp;
                }
                return BigDecimal.fromInteger2(compactVal, scale, prec);
            }
        }
        return new BigDecimal(intVal, BigDecimal.INFLATED, scale, prec);
    }

    /**
     * Returns a `BigDecimal` created from `number` value with
     * given scale rounded according to the MathContext settings
     * @internal
     */
    private static doRound3(compactVal: number, scale: number, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        if (mcp > 0 && mcp < 16) {
            let prec = BigDecimal.integerDigitLength(compactVal);
            let drop = prec - mcp; // drop can't be more than 15
            while (drop > 0) {
                scale = BigDecimal.checkScaleNonZero(scale - drop);
                compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                prec = BigDecimal.integerDigitLength(compactVal);
                drop = prec - mcp;
            }
            return BigDecimal.fromInteger2(compactVal, scale, prec);
        }
        return BigDecimal.fromInteger3(compactVal, scale);
    }

    /** @internal */
    private static stripZerosToMatchScale(
        intVal: BigInt, intCompact: number, scale: number, preferredScale: number
    ): BigDecimal {
        if (intCompact !== BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(intCompact, scale, preferredScale);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(intVal === null ? BigDecimal.INFLATED_BIGINT : intVal.valueOf(),
                scale, preferredScale);
        }
    }

    /**
     * Remove insignificant trailing zeros from this
     * value until the preferred scale is reached or no
     * more zeros can be removed. If the preferred scale is less than
     * BigDecimal.MIN_INT_VALUE, all the trailing zeros will be removed.
     *
     * @return new `BigDecimal` with a scale possibly reduced
     * to be closed to the preferred scale.
     * @throws RangeError if scale overflows.
     * @internal
     */
    private static createAndStripZerosToMatchScale(compactVal: number, scale: number, preferredScale: number): BigDecimal {
        while (Math.abs(compactVal) >= 10 && scale > preferredScale) {
            if ((compactVal & 1) !== 0)
                break;
            const r = compactVal % 10;
            if (r !== 0)
                break;
            compactVal /= 10;
            scale = this.checkScale2(compactVal, scale - 1);
        }
        return BigDecimal.fromInteger3(compactVal, scale);
    }

    /**
     * Remove insignificant trailing zeros from this
     * bigint value until the preferred scale is reached or no
     * more zeros can be removed. If the preferred scale is less than
     * BigDecimal.MIN_INT_VALUE, all the trailing zeros will be removed.
     *
     * @return new `BigDecimal` with a scale possibly reduced
     * to be closed to the preferred scale.
     * @throws RangeError if scale overflows.
     * @internal
     */
    private static createAndStripZerosToMatchScale2(intVal: BigInt, scale: number, preferredScale: number): BigDecimal {
        let qr: BigInt[];
        while (BigDecimal.bigIntCompareMagnitude(intVal!, BigInt(10)) >= 0 && scale > preferredScale) {
            if (intVal!.valueOf() % BigDecimal.twoBigInt === BigDecimal.oneBigInt)
                break;
            qr = [intVal!.valueOf() / BigInt(10), intVal!.valueOf() % BigInt(10)];
            if (BigDecimal.bigIntSignum(qr[1]) !== 0)
                break;
            intVal = qr[0];
            scale = this.checkScale3(intVal, scale - 1);
        }
        return BigDecimal.fromBigInt5(intVal!, scale, 0);
    }

    /**
     * Match the scales of two `BigDecimal`s to align their
     * least significant digits.
     *
     * If the scales of val[0] and val[1] differ, rescale
     * (non-destructively) the lower-scaled `BigDecimal` so
     * they match.  That is, the lower-scaled reference will be
     * replaced by a reference to a new object with the same scale as
     * the other `BigDecimal`.
     *
     * @param val array of two elements referring to the two
     *            `BigDecimal`s to be aligned.
     * @internal
     */
    private static matchScale(val: BigDecimal[]): void {
        if (val[0]._scale < val[1]._scale) {
            val[0] = val[0].setScale(val[1]._scale, RoundingMode.UNNECESSARY);
        } else if (val[1]._scale < val[0]._scale) {
            val[1] = val[1].setScale(val[0]._scale, RoundingMode.UNNECESSARY);
        }
    }

    /**
     * Returns an array of length two, the sum of whose entries is
     * equal to the rounded sum of the `BigDecimal` arguments.
     *
     * If the digit positions of the arguments have a sufficient
     * gap between them, the value smaller in magnitude can be
     * condensed into a "sticky bit" and the end result will
     * round the same way <em>if</em> the precision of the final
     * result does not include the high order digit of the small
     * magnitude operand.
     *
     * Note that while strictly speaking this is an optimization,
     * it makes a much wider range of additions practical.
     *
     * This corresponds to a pre-shift operation in a fixed
     * precision floating-point adder; this method is complicated by
     * variable precision of the result as determined by the
     * MathContext.  A more nuanced operation could implement a
     * "right shift" on the smaller magnitude operand so
     * that the number of digits of the smaller operand could be
     * reduced even though the significands partially overlapped.
     * @internal
     */
    private preAlign(augend: BigDecimal, padding: number, mc: MathContext): BigDecimal[] {
        let big: BigDecimal;
        let small: BigDecimal;

        if (padding < 0) {
            big = this;
            small = augend;
        } else {
            big = augend;
            small = this;
        }

        const estResultUlpScale = big._scale - big.precision() + mc.precision;

        const smallHighDigitPos = small._scale - small.precision() + 1;
        if (smallHighDigitPos > big._scale + 2 &&
            smallHighDigitPos > estResultUlpScale + 2) {
            small = BigDecimal.fromInteger3(small.signum(), this.checkScale(Math.max(big._scale, estResultUlpScale) + 3));
        }
        return [big, small];
    }

    /**
     * Returns a `BigDecimal` whose value is `(-this)`,
     * with rounding according to the context settings.
     *
     * @param mc the context to use.
     * @return `-this`, rounded as necessary.
     */
    negate(mc?: MathContext): BigDecimal {
        let result = this.intCompact === BigDecimal.INFLATED ?
            new BigDecimal(
                BigDecimal.minusOneBigInt * this.intVal!.valueOf(), BigDecimal.INFLATED, this._scale, this._precision
            ) :
            BigDecimal.fromInteger2(-this.intCompact, this._scale, this._precision);
        if (mc) {
            result = result.plus(mc);
        }
        return result;
    }

    /**
     * Returns a `BigDecimal` whose value is `(this + augend)`,
     * with rounding according to the context settings.
     *
     * If either number is zero and the precision setting is nonzero then
     * the other number, rounded if necessary, is used as the result.
     *
     * @param augend value to be added to this `BigDecimal`. This value will
     * be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return `this + augend`, rounded as necessary.
     */
    add(augend: any, mc?: MathContext): BigDecimal {
        augend = BigDecimal.convertToBigDecimal(augend);
        if (!mc || (mc && mc.precision === 0)) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                if (augend.intCompact !== BigDecimal.INFLATED) {
                    return BigDecimal.add3(this.intCompact, this._scale, augend.intCompact, augend._scale);
                } else {
                    return BigDecimal.add2(this.intCompact, this._scale, augend.intVal!, augend._scale);
                }
            } else {
                if (augend.intCompact !== BigDecimal.INFLATED) {
                    return BigDecimal.add2(augend.intCompact, augend._scale, this.intVal!, this._scale);
                } else {
                    return BigDecimal.add1(this.intVal!, this._scale, augend.intVal!, augend._scale);
                }
            }
        }

        // If either number is zero then the other number, rounded and
        // scaled if necessary, is used as the result.
        let lhs: BigDecimal = this;
        const lhsIsZero = lhs.signum() === 0;
        const augendIsZero = augend.signum() === 0;

        if (lhsIsZero || augendIsZero) {
            const preferredScale = Math.max(lhs._scale, augend._scale);

            if (lhsIsZero && augendIsZero)
                return BigDecimal.zeroValueOf(preferredScale);
            const result = lhsIsZero ? BigDecimal.doRound(augend, mc) : BigDecimal.doRound(lhs, mc);

            if (result._scale === preferredScale)
                return result;
            else if (result._scale > preferredScale) {
                return BigDecimal.stripZerosToMatchScale(result.intVal!, result.intCompact, result._scale, preferredScale);
            } else { // result.scale < preferredScale
                const precisionDiff = mc.precision - result.precision();
                const scaleDiff = preferredScale - result._scale;

                if (precisionDiff >= scaleDiff)
                    return result.setScale(preferredScale); // can achieve target scale
                else
                    return result.setScale(result._scale + precisionDiff);
            }
        }
        const padding = lhs._scale - augend._scale;
        if (padding !== 0) { // scales differ; alignment needed
            const arg = this.preAlign(augend, padding, mc);
            BigDecimal.matchScale(arg);
            lhs = arg[0];
            augend = arg[1];
        }
        return BigDecimal.doRound2(lhs.inflated().valueOf() + augend.inflated().valueOf(), lhs._scale, mc);
    }

    /**
     * Returns a `BigDecimal` whose value is `(this - subtrahend)`,
     * with rounding according to the context settings.
     *
     * If `subtrahend` is zero then this, rounded if necessary, is used as the
     * result.  If this is zero then the result is `subtrahend.negate(mc)`.
     *
     * @param subtrahend value to be subtracted from this `BigDecimal`. This value
     * will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return `this - subtrahend`, rounded as necessary.
     */
    subtract(subtrahend: any, mc?: MathContext): BigDecimal {
        subtrahend = BigDecimal.convertToBigDecimal(subtrahend);
        if (!mc || (mc && mc.precision === 0)) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                if ((subtrahend.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.add3(this.intCompact, this._scale, -subtrahend.intCompact, subtrahend._scale);
                } else {
                    return BigDecimal.add2(
                        this.intCompact, this._scale, BigDecimal.minusOneBigInt * subtrahend.intVal!.valueOf(), subtrahend._scale
                    );
                }
            } else {
                if ((subtrahend.intCompact !== BigDecimal.INFLATED)) {
                    // Pair of subtrahend values given before pair of
                    // values from this BigDecimal to avoid need for
                    // method overloading on the specialized add method
                    return BigDecimal.add2(-subtrahend.intCompact, subtrahend._scale, this.intVal!, this._scale);
                } else {
                    return BigDecimal.add1(
                        this.intVal!, this._scale, BigDecimal.minusOneBigInt * subtrahend.intVal!.valueOf(), subtrahend._scale
                    );
                }
            }
        }
        // share the special rounding code in add()
        return this.add(subtrahend.negate(), mc);
    }

    /**
     * Returns a `BigDecimal` whose value is <code>(this &times;
     * multiplicand)</code>, with rounding according to the context settings.
     *
     * @param multiplicand value to be multiplied by this `BigDecimal`. This
     * value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return `this * multiplicand`, rounded as necessary.
     */
    multiply(multiplicand: any, mc?: MathContext): BigDecimal {
        multiplicand = BigDecimal.convertToBigDecimal(multiplicand);
        if (!mc || (mc && mc.precision === 0)) {
            const productScale = this.checkScale(this._scale + multiplicand._scale);
            if (this.intCompact !== BigDecimal.INFLATED) {
                if ((multiplicand.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.multiply2(this.intCompact, multiplicand.intCompact, productScale);
                } else {
                    return BigDecimal.multiply3(this.intCompact, multiplicand.intVal!, productScale);
                }
            } else {
                if ((multiplicand.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.multiply3(multiplicand.intCompact, this.intVal!, productScale);
                } else {
                    return BigDecimal.multiply4(this.intVal!, multiplicand.intVal!, productScale);
                }
            }
        }
        const productScale = this.checkScale(this._scale + multiplicand._scale);
        if (this.intCompact !== BigDecimal.INFLATED) {
            if ((multiplicand.intCompact !== BigDecimal.INFLATED)) {
                return BigDecimal.multiplyAndRound1(this.intCompact, multiplicand.intCompact, productScale, mc);
            } else {
                return BigDecimal.multiplyAndRound2(this.intCompact, multiplicand.intVal!, productScale, mc);
            }
        } else {
            if ((multiplicand.intCompact !== BigDecimal.INFLATED)) {
                return BigDecimal.multiplyAndRound2(multiplicand.intCompact, this.intVal!, productScale, mc);
            } else {
                return BigDecimal.multiplyAndRound3(this.intVal!, multiplicand.intVal!, productScale, mc);
            }
        }
    }

    /**
     * Returns a `BigDecimal` whose value is `(this / divisor)`,
     * and whose scale is as specified.  If rounding must
     * be performed to generate a result with the specified scale, the
     * specified rounding mode is applied.
     *
     * @param divisor value by which this `BigDecimal` is to be divided.
     * This value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param scale scale of the `BigDecimal` quotient to be returned.
     * @param roundingMode rounding mode to apply.
     * @return `this / divisor`
     * @throws RangeError
     * * If `divisor` is zero
     * * If `roundingMode==RoundingMode.UNNECESSARY` and the specified scale is insufficient to represent the result
     *   of the division exactly.
     * * If scale is given but rounding mode is not given.
     */
    divide(divisor: any, scale?: number, roundingMode?: RoundingMode): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        /*
         * Handle zero cases first.
         */
        if (divisor.signum() === 0) {
            if (this.signum() === 0)
                throw new RangeError('Division undefined');
            throw new RangeError('Division by zero');
        }
        if (roundingMode === undefined) {
            if (scale !== undefined) {
                throw new RangeError('Rounding mode is necessary if scale is given.');
            } else {
                return this.divide6(divisor);
            }
        } else {
            if (scale === undefined) {
                scale = this._scale;
            }
            if (roundingMode < RoundingMode.UP || roundingMode > RoundingMode.UNNECESSARY)
                throw new RangeError('Invalid rounding mode');
            if (this.intCompact !== BigDecimal.INFLATED) {
                if ((divisor.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.divide7(
                        this.intCompact, this._scale, divisor.intCompact, divisor._scale, scale, roundingMode
                    );
                } else {
                    return BigDecimal.divide8(this.intCompact, this._scale, divisor.intVal!, divisor._scale, scale, roundingMode);
                }
            } else {
                if ((divisor.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.divide9(this.intVal!, this._scale, divisor.intCompact, divisor._scale, scale, roundingMode);
                } else {
                    return BigDecimal.divide10(this.intVal!, this._scale, divisor.intVal!, divisor._scale, scale, roundingMode);
                }
            }
        }
    }

    /** @internal */
    private static saturateScale(scale: number): number {
        if (scale <= BigDecimal.MAX_INT_VALUE && scale >= BigDecimal.MIN_INT_VALUE) {
            return scale;
        } else {
            return (scale < 0 ? BigDecimal.MIN_INT_VALUE : BigDecimal.MAX_INT_VALUE);
        }
    }

    /** @internal */
    private divide6(divisor: BigDecimal): BigDecimal {
        // Calculate preferred scale
        const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);

        if (this.signum() === 0) // 0/y
            return BigDecimal.zeroValueOf(preferredScale);
        else {
            /*
             * If the quotient this/divisor has a terminating decimal
             * expansion, the expansion can have no more than
             * (a.precision() + ceil(10*b.precision)/3) digits.
             * Therefore, create a MathContext object with this
             * precision and do a divide with the UNNECESSARY rounding
             * mode.
             */
            const mc = new MathContext(
                Math.min(this.precision() + Math.ceil(10.0 * divisor.precision() / 3.0), BigDecimal.MAX_INT_VALUE),
                RoundingMode.UNNECESSARY
            );

            let quotient;
            try {
                quotient = this.divideWithMathContext(divisor, mc);
            } catch (e) {
                throw new RangeError('Non-terminating decimal expansion; ' +
                    'no exact representable decimal result.');
            }

            const quotientScale = quotient.scale();

            // divide(BigDecimal, mc) tries to adjust the quotient to
            // the desired one by removing trailing zeros; since the
            // exact divide method does not have an explicit digit
            // limit, we can add zeros too.
            if (preferredScale > quotientScale)
                return quotient.setScale(preferredScale, RoundingMode.UNNECESSARY);

            return quotient;
        }
    }

    /**
     * Returns a `BigDecimal` whose value is `(this /
     * divisor)`, with rounding according to the context settings.
     *
     * @param divisor value by which this `BigDecimal` is to be divided.
     * This value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @throws RangeError if the exact quotient does not have a
     *         terminating decimal expansion, including dividing by zero
     * @return `this / divisor`
     */
    divideWithMathContext(divisor: any, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (divisor.signum() === 0) { // x/0
            if (this.signum() === 0) // 0/0
                throw new RangeError('Division undefined'); // NaN
            throw new RangeError('Division by zero');
        }
        if (!mc || (mc && mc.precision === 0)) {
            const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);

            if (this.signum() === 0)
                return BigDecimal.zeroValueOf(preferredScale);
            else {
                const mc = new MathContext(
                    Math.min(this.precision() + Math.ceil(10.0 * divisor.precision() / 3.0), Number.MAX_SAFE_INTEGER),
                    RoundingMode.UNNECESSARY
                );
                let quotient: BigDecimal;
                try {
                    quotient = this.divideWithMathContext(divisor, mc);
                } catch (e) {
                    throw new RangeError('Non-terminating decimal expansion; no exact representable decimal result.');
                }

                const quotientScale = quotient._scale;

                if (preferredScale > quotientScale)
                    return quotient.setScale(preferredScale, RoundingMode.UNNECESSARY);
                return quotient;
            }
        }
        const preferredScale = this._scale - divisor._scale;
        // Now calculate the answer.  We use the existing
        // divide-and-round method, but as this rounds to scale we have
        // to normalize the values here to achieve the desired result.
        // For x/y we first handle y=0 and x=0, and then normalize x and
        // y to give x' and y' with the following constraints:
        //   (a) 0.1 <= x' < 1
        //   (b)  x' <= y' < 10*x'
        // Dividing x'/y' with the required scale set to mc.precision then
        // will give a result in the range 0.1 to 1 rounded to exactly
        // the right number of digits (except in the case of a result of
        // 1.000... which can arise when x=y, or when rounding overflows
        // The 1.000... case will reduce properly to 1.
        if (this.signum() === 0)
            return BigDecimal.zeroValueOf(BigDecimal.saturateScale(preferredScale));
        const xscale = this.precision();
        const yscale = divisor.precision();
        if (this.intCompact !== BigDecimal.INFLATED) {
            if (divisor.intCompact !== BigDecimal.INFLATED) {
                return BigDecimal.divide2(this.intCompact, xscale, divisor.intCompact, yscale, preferredScale, mc);
            } else {
                return BigDecimal.divide3(this.intCompact, xscale, divisor.intVal!, yscale, preferredScale, mc);
            }
        } else {
            if (divisor.intCompact !== BigDecimal.INFLATED) {
                return BigDecimal.divide4(this.intVal!, xscale, divisor.intCompact, yscale, preferredScale, mc);
            } else {
                return BigDecimal.divide5(this.intVal!, xscale, divisor.intVal!, yscale, preferredScale, mc);
            }
        }
    }

    /** @internal */
    private static multiply1(x: number, y: number): number {
        const product = x * y;
        if (product <= Number.MAX_SAFE_INTEGER && product > Number.MIN_SAFE_INTEGER) {
            return product;
        }
        return BigDecimal.INFLATED;
    }

    /** @internal */
    private static multiply2(x: number, y: number, scale: number): BigDecimal {
        const product = BigDecimal.multiply1(x, y);
        if (product !== BigDecimal.INFLATED) {
            return BigDecimal.fromInteger3(product, scale);
        }
        return new BigDecimal(BigInt(x) * BigInt(y), BigDecimal.INFLATED, scale, 0);
    }

    /** @internal */
    private static multiply3(x: number, y: BigInt, scale: number): BigDecimal {
        if (x === 0) {
            return BigDecimal.zeroValueOf(scale);
        }
        return new BigDecimal(y!.valueOf() * BigInt(x), BigDecimal.INFLATED, scale, 0);
    }

    /** @internal */
    private static multiply4(x: BigInt, y: BigInt, scale: number): BigDecimal {
        return new BigDecimal(x!.valueOf() * y!.valueOf(), BigDecimal.INFLATED, scale, 0);
    }

    /**
     * Multiplies two integers and rounds according to `MathContext`
     * @internal
     */
    private static multiplyAndRound1(x: number, y: number, scale: number, mc: MathContext): BigDecimal {
        const product = BigDecimal.multiply1(x, y);
        if (product !== BigDecimal.INFLATED) {
            return BigDecimal.doRound3(product, scale, mc);
        }
        let rsign = 1;
        if (x < 0) {
            x = -x;
            rsign = -1;
        }
        if (y < 0) {
            y = -y;
            rsign *= -1;
        }
        const res = new BigDecimal(BigInt(x) * BigInt(y) * BigInt(rsign), BigDecimal.INFLATED, scale, 0);
        return BigDecimal.doRound(res, mc);
    }

    /** @internal */
    private static multiplyAndRound2(x: number, y: BigInt, scale: number, mc: MathContext): BigDecimal {
        if (x === 0) {
            return BigDecimal.zeroValueOf(scale);
        }
        return BigDecimal.doRound2(y!.valueOf() * BigInt(x), scale, mc);
    }

    /** @internal */
    private static multiplyAndRound3(x: BigInt, y: BigInt, scale: number, mc: MathContext): BigDecimal {
        return BigDecimal.doRound2(x!.valueOf() * y!.valueOf(), scale, mc);
    }

    /** @internal */
    private static divide2(
        xs: number, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        const mcp = mc.precision;
        if (xscale <= yscale && yscale < 15 && mcp < 15) {
            return BigDecimal.divideSmallFastPath(xs, xscale, ys, yscale, preferredScale, mc);
        }
        if (BigDecimal.compareMagnitudeNormalized(xs, xscale, ys, yscale) > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        const roundingMode = mc.roundingMode;
        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
        let quotient: BigDecimal;
        if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {
            const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
            let scaledXs;
            if ((scaledXs = BigDecimal.integerMultiplyPowerTen(xs, raise)) === BigDecimal.INFLATED) {
                const rb = BigDecimal.bigMultiplyPowerTen2(xs, raise);
                quotient = BigDecimal.divideAndRound4(
                    rb, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                quotient = BigDecimal.divideAndRound2(
                    scaledXs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            }
        } else {
            const newScale = BigDecimal.checkScaleNonZero(xscale - mcp);

            if (newScale === yscale) { // easy case
                quotient = BigDecimal.divideAndRound2(
                    xs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
                let scaledYs;
                if ((scaledYs = BigDecimal.integerMultiplyPowerTen(ys, raise)) === BigDecimal.INFLATED) {
                    const rb = BigDecimal.bigMultiplyPowerTen2(ys, raise);
                    quotient = BigDecimal.divideAndRound3(
                        BigInt(xs), rb, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                } else {
                    quotient = BigDecimal.divideAndRound2(
                        xs, scaledYs, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                }
            }
        }
        // doRound, here, only affects 1000000000 case.
        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide3(
        xs: number, xscale: number, ys: BigInt, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if (BigDecimal.compareMagnitudeNormalized2(xs, xscale, ys, yscale) > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        let quotient: BigDecimal;
        const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {
            const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
            const rb = BigDecimal.bigMultiplyPowerTen2(xs, raise);
            quotient = BigDecimal.divideAndRound3(
                rb, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
            );
        } else {
            const newScale = BigDecimal.checkScaleNonZero(xscale - mcp);
            const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
            const rb = BigDecimal.bigMultiplyPowerTen3(ys, raise);
            quotient = BigDecimal.divideAndRound3(
                BigInt(xs), rb, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
            );
        }
        // doRound, here, only affects 1000000000 case.
        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide4(
        xs: BigInt, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if ((-BigDecimal.compareMagnitudeNormalized2(ys, yscale, xs, xscale)) > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        let quotient: BigDecimal;
        const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {
            const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
            const rb = BigDecimal.bigMultiplyPowerTen3(xs, raise);
            quotient = BigDecimal.divideAndRound4(
                rb, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
            );
        } else {
            const newScale = BigDecimal.checkScaleNonZero(xscale - mcp);
            if (newScale === yscale) { // easy case
                quotient = BigDecimal.divideAndRound4(
                    xs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
                let scaledYs;
                if ((scaledYs = BigDecimal.integerMultiplyPowerTen(ys, raise)) === BigDecimal.INFLATED) {
                    const rb = BigDecimal.bigMultiplyPowerTen2(ys, raise);
                    quotient = BigDecimal.divideAndRound3(
                        xs, rb, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                } else {
                    quotient = BigDecimal.divideAndRound4(
                        xs, scaledYs, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                }
            }
        }

        // doRound, here, only affects 1000000000 case.
        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide5(
        xs: BigInt, xscale: number, ys: BigInt, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        // Normalize dividend & divisor so that both fall into [0.1, 0.999...]
        if (BigDecimal.compareMagnitudeNormalized3(xs, xscale, ys, yscale) > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

        // In order to find out whether the divide generates the exact result,
        // we avoid calling the above divide method. 'quotient' holds the
        // return BigDecimal object whose scale will be set to 'scl'.
        let quotient: BigDecimal;
        const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
        if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {
            const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
            const rb = BigDecimal.bigMultiplyPowerTen3(xs, raise);
            quotient = BigDecimal.divideAndRound3(
                rb, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
            );
        } else {
            const newScale = BigDecimal.checkScaleNonZero(xscale - mcp);
            const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
            const rb = BigDecimal.bigMultiplyPowerTen3(ys, raise);
            quotient = BigDecimal.divideAndRound3(
                xs, rb, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
            );
        }

        // doRound, here, only affects 1000000000 case.
        return BigDecimal.doRound(quotient, mc);
    }

    /**
     * Returns a `BigDecimal` whose value is the integer part
     * of `(this / divisor)`.  Since the integer part of the
     * exact quotient does not depend on the rounding mode, the
     * rounding mode does not affect the values returned by this
     * method.  The preferred scale of the result is
     * `(this.scale() - divisor.scale())`. A
     * `RangeError` is thrown if the integer part of
     * the exact quotient needs more than `mc.precision`
     * digits.
     *
     * @param divisor value by which this `BigDecimal` is to be divided.
     * This value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return The integer part of `this / divisor`.
     * @throws RangeError if divisor is 0
     * @throws RangeError if `mc.precision > 0` and the result
     *         requires a precision of more than `mc.precision` digits.
     */
    divideToIntegralValue(divisor: any, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (!mc || (mc && (mc.precision === 0 || this.compareMagnitude(divisor) < 0))) {
            // Calculate preferred scale
            const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);
            if (this.compareMagnitude(divisor) < 0) {
                // much faster when this << divisor
                return BigDecimal.zeroValueOf(preferredScale);
            }

            if (this.signum() === 0 && divisor.signum() !== 0)
                return this.setScale(preferredScale, RoundingMode.UNNECESSARY);

            // Perform a divide with enough digits to round to a correct
            // integer value; then remove any fractional digits
            const maxDigits = Math.min(
                this.precision() + Math.ceil(10.0 * divisor.precision() / 3.0) + Math.abs(this._scale - divisor._scale) + 2,
                Number.MAX_SAFE_INTEGER
            );
            let quotient = this.divideWithMathContext(divisor, new MathContext(maxDigits, RoundingMode.DOWN));
            if (quotient._scale > 0) {
                quotient = quotient.setScale(0, RoundingMode.DOWN);
                quotient = BigDecimal.stripZerosToMatchScale(
                    quotient.intVal!, quotient.intCompact, quotient._scale, preferredScale
                );
            }

            if (quotient._scale < preferredScale) {
                // pad with zeros if necessary
                quotient = quotient.setScale(preferredScale, RoundingMode.UNNECESSARY);
            }

            return quotient;
        }

        // Calculate preferred scale
        const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);

        /*
         * Perform a normal divide to mc.precision digits.  If the
         * remainder has absolute value less than the divisor, the
         * integer portion of the quotient fits into mc.precision
         * digits.  Next, remove any fractional digits from the
         * quotient and adjust the scale to the preferred value.
         */
        let result = this.divideWithMathContext(divisor, new MathContext(mc.precision, RoundingMode.DOWN));

        if (result._scale < 0) {
            /*
             * Result is an integer. See if quotient represents the
             * full integer portion of the exact quotient; if it does,
             * the computed remainder will be less than the divisor.
             */
            const product = result.multiply(divisor);
            // If the quotient is the full integer value,
            // |dividend-product| < |divisor|.
            if (this.subtract(product).compareMagnitude(divisor) >= 0) {
                throw new RangeError('Division impossible');
            }
        } else if (result._scale > 0) {
            /*
             * Integer portion of quotient will fit into precision
             * digits; recompute quotient to scale 0 to avoid double
             * rounding and then try to adjust, if necessary.
             */
            result = result.setScale(0, RoundingMode.DOWN);
        }
        // else result.scale() == 0;

        let precisionDiff;
        if ((preferredScale > result._scale) &&
            (precisionDiff = mc.precision - result.precision()) > 0) {
            return result.setScale(result._scale + Math.min(precisionDiff, preferredScale - result._scale));
        } else {
            return BigDecimal.stripZerosToMatchScale(result.intVal!, result.intCompact, result._scale, preferredScale);
        }
    }

    /**
     * Returns a `BigDecimal` whose value is `(this % divisor)`, with rounding according to the context settings.
     * The `MathContext` settings affect the implicit divide
     * used to compute the remainder.  The remainder computation
     * itself is by definition exact.  Therefore, the remainder may
     * contain more than `mc.getPrecision()` digits.
     *
     * The remainder is given by
     * `this.subtract(this.divideToIntegralValue(divisor,
     * mc).multiply(divisor))`.  Note that this is not the modulo
     * operation (the result can be negative).
     *
     * @param divisor value by which this `BigDecimal` is to be divided.
     * This value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return `this % divisor`, rounded as necessary.
     * @throws RangeError if divisor is 0
     * @throws RangeError if the result is inexact but the
     *         rounding mode is `UNNECESSARY`, or `mc.precision`
     *         > 0 and the result of {`this.divideToIntegralValue(divisor)` would
     *         require a precision of more than `mc.precision` digits.
     * @see    {@link divideToIntegralValue}
     */
    remainder(divisor: any, mc?: MathContext): BigDecimal {
        return this.divideAndRemainder(divisor, mc)[1];
    }

    /**
     * Version of compareTo that ignores sign.
     * @internal
     */
    private compareMagnitude(val: BigDecimal): number {
        // Match scales, avoid unnecessary inflation
        let ys = val.intCompact;
        let xs = this.intCompact;
        if (xs === 0)
            return (ys === 0) ? 0 : -1;
        if (ys === 0)
            return 1;

        const sdiff = this._scale - val._scale;
        if (sdiff !== 0) {
            // Avoid matching scales if the (adjusted) exponents differ
            const xae = this.precision() - this._scale; // [-1]
            const yae = val.precision() - val._scale; // [-1]
            if (xae < yae)
                return -1;
            if (xae > yae)
                return 1;
            if (sdiff < 0) {
                // The cases sdiff <= BigDecimal.MIN_INT_VALUE intentionally fall through.
                if (sdiff > Number.MIN_SAFE_INTEGER &&
                    (xs === BigDecimal.INFLATED ||
                        (xs = BigDecimal.integerMultiplyPowerTen(xs, -sdiff)) === BigDecimal.INFLATED) &&
                    ys === BigDecimal.INFLATED) {
                    const rb = this.bigMultiplyPowerTen(-sdiff);
                    return BigDecimal.bigIntCompareMagnitude(rb, val.intVal!);
                }
            } else { // sdiff > 0
                // The cases sdiff > Integer.MAX_INT_VALUE intentionally fall through.
                if (sdiff <= Number.MAX_SAFE_INTEGER &&
                    (ys === BigDecimal.INFLATED ||
                        (ys = BigDecimal.integerMultiplyPowerTen(ys, sdiff)) === BigDecimal.INFLATED) &&
                    xs === BigDecimal.INFLATED) {
                    const rb = val.bigMultiplyPowerTen(sdiff);
                    return BigDecimal.bigIntCompareMagnitude(this.intVal!, rb);
                }
            }
        }
        if (xs !== BigDecimal.INFLATED)
            return (ys !== BigDecimal.INFLATED) ? BigDecimal.integerCompareMagnitude(xs, ys) : -1;
        else if (ys !== BigDecimal.INFLATED)
            return 1;
        else
            return BigDecimal.bigIntCompareMagnitude(this.intVal!, val.intVal!);
    }

    /**
     * Compares this `BigDecimal` with the specified
     * object for equality.  Unlike {@link compareTo},
     * this method considers two `BigDecimal`
     * objects equal only if they are equal in value and
     * scale. Therefore 2.0 is not equal to 2.00 when compared by this
     * method since the former has [`BigInt`, `scale`]
     * components equal to [20, 1] while the latter has components
     * equal to [200, 2].
     *
     * One example that shows how 2.0 and 2.00 are **not**
     * substitutable for each other under some arithmetic operations
     * are the two expressions:
     *
     * @param value to which this `BigDecimal` is
     *         to be compared.
     * @return true if and only if the specified value is a
     *         BigDecimal whose value and scale are equal to this
     *         BigDecimal's.
     * @see    {@link compareTo}
     */
    equals(value: any): boolean {
        if (!(value instanceof BigDecimal))
            return false;
        if (value === this)
            return true;
        if (this._scale !== value._scale)
            return false;
        const s = this.intCompact;
        let xs = value.intCompact;
        if (s !== BigDecimal.INFLATED) {
            if (xs === BigDecimal.INFLATED)
                xs = BigDecimal.compactValFor(value.intVal!);
            return xs === s;
        } else if (xs !== BigDecimal.INFLATED)
            return xs === BigDecimal.compactValFor(this.intVal!);

        return this.inflated() === value.inflated();
    }

    /**
     * Returns a two-element `BigDecimal` array containing the
     * result of `divideToIntegralValue` followed by the result of
     * `remainder` on the two operands calculated with rounding
     * according to the context settings.
     *
     * Note that if both the quotient and remainder are
     * needed, this method is faster than using the
     * `divideToIntegralValue` and `remainder` methods
     * separately because the division need only be carried out once.
     *
     * @param divisor value by which this `BigDecimal` is to be divided,
     *         and the remainder computed. This value will be converted to a
     *         `BigDecimal` before the operation. See the
     *         {@link Big | constructor} to learn more about the conversion.
     * @param mc the context to use.
     * @return a two element `BigDecimal` array: the quotient
     *         (the result of `divideToIntegralValue`) is the
     *         initial element and the remainder is the final element.
     * @throws RangeError if divisor is 0
     * @throws RangeError if the result is inexact but the
     *         rounding mode is `UNNECESSARY`, or `mc.precision > 0`
     *         and the result of `this.divideToIntegralValue(divisor)` would
     *         require a precision of more than `mc.precision` digits.
     * @see    {@link divideToIntegralValue}
     * @see    {@link remainder}
     */
    divideAndRemainder(divisor: any, mc?: MathContext): [BigDecimal, BigDecimal] {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        const result = new Array<BigDecimal>(2);

        result[0] = this.divideToIntegralValue(divisor, mc);
        result[1] = this.subtract(result[0].multiply(divisor));
        return <[BigDecimal, BigDecimal]>result;
    }

    /**
     * Returns an approximation to the square root of `this`
     * with rounding according to the context settings.
     *
     * The preferred scale of the returned result is equal to
     * `this.scale()/2`. The value of the returned result is
     * always within one ulp of the exact decimal value for the
     * precision in question.  If the rounding mode is {@link
        * RoundingMode.HALF_UP}, {@link RoundingMode.HALF_DOWN},
     * or {@link RoundingMode.HALF_EVEN}, the
     * result is within one half an ulp of the exact decimal value.
     *
     * @param mc the context to use.
     * @return the square root of `this`.
     * @throws RangeError if `this` is less than zero.
     * @throws RangeError if an exact result is requested
     * mc.getPrecision() is 0 and there is no finite decimal
     * expansion of the exact result
     * @throws RangeError if mc.getRoundingMode() is `RoundingMode.UNNECESSARY` and
     * the exact result cannot fit in `mc.getPrecision()`
     * digits.
     */
    sqrt(mc: MathContext): BigDecimal {
        const signum = this.signum();
        if (signum !== 1) {
            let result = null;
            switch (signum) {
            case -1:
                throw new RangeError('Attempted square root of negative BigDecimal');
            case 0:
                result = BigDecimal.fromInteger3(0, Math.trunc(this._scale / 2));
                return result;

            default:
                throw new RangeError('Bad value from signum');
            }
        } else {
            /*
             * The following code draws on the algorithm presented in
             * "Properly Rounded Variable Precision Square Root," Hull and
             * Abrham, ACM Transactions on Mathematical Software, Vol 11,
             * No. 3, September 1985, Pages 229-237.
             *
             * The BigDecimal computational model differs from the one
             * presented in the paper in several ways: first BigDecimal
             * numbers aren't necessarily normalized, second many more
             * rounding modes are supported, including UNNECESSARY, and
             * exact results can be requested.
             *
             * The main steps of the algorithm below are as follows,
             * first argument reduce the value to the numerical range
             * [1, 10) using the following relations:
             *
             * x = y * 10 ^ exp
             * sqrt(x) = sqrt(y) * 10^(exp / 2) if exp is even
             * sqrt(x) = sqrt(y/10) * 10 ^((exp+1)/2) is exp is odd
             *
             * Then use Newton's iteration on the reduced value to compute
             * the numerical digits of the desired result.
             *
             * Finally, scale back to the desired exponent range and
             * perform any adjustment to get the preferred scale in the
             * representation.
             */

            // The code below favors relative simplicity over checking
            // for special cases that could run faster.

            const preferredScale = Math.trunc(this._scale / 2);
            const zeroWithFinalPreferredScale = BigDecimal.fromInteger3(0, preferredScale);

            // First phase of numerical normalization, strip trailing
            // zeros and check for even powers of 10.
            const stripped = this.stripTrailingZeros();
            const strippedScale = stripped._scale;

            // Numerically sqrt(10^2N) = 10^N
            if (stripped.isPowerOfTen() && strippedScale % 2 === 0) {
                let result = BigDecimal.fromInteger3(1, Math.trunc(strippedScale / 2));
                if (result._scale !== preferredScale) {
                    // Adjust to requested precision and preferred
                    // scale as appropriate.
                    result = result.add(zeroWithFinalPreferredScale, mc);
                }
                return result;
            }

            // After stripTrailingZeros, the representation is normalized as
            //
            // unscaledValue * 10^(-scale)
            //
            // where unscaledValue is an integer with the mimimum
            // precision for the cohort of the numerical value. To
            // allow binary floating-point hardware to be used to get
            // approximately a 15 digit approximation to the square
            // root, it is helpful to instead normalize this so that
            // the significand portion is to right of the decimal
            // point by roughly (scale() - precision() + 1).

            // Now the precision / scale adjustment
            let scaleAdjust;
            const scale = stripped._scale - stripped.precision() + 1;
            if (scale % 2 === 0) {
                scaleAdjust = scale;
            } else {
                scaleAdjust = scale - 1;
            }

            const working = stripped.scaleByPowerOfTen(scaleAdjust);

            // Use good ole' Math.sqrt to get the initial guess for
            // the Newton iteration, good to at least 15 decimal
            // digits. This approach does incur the cost of a
            //
            // BigDecimal -> double -> BigDecimal
            //
            // conversion cycle, but it avoids the need for several
            // Newton iterations in BigDecimal arithmetic to get the
            // working answer to 15 digits of precision. If many fewer
            // than 15 digits were needed, it might be faster to do
            // the loop entirely in BigDecimal arithmetic.
            //
            // (A double value might have as many as 17 decimal
            // digits of precision; it depends on the relative density
            // of binary and decimal numbers at different regions of
            // the number line.)
            //
            // (It would be possible to check for certain special
            // cases to avoid doing any Newton iterations. For
            // example, if the BigDecimal -> double conversion was
            // known to be exact and the rounding mode had a
            // low-enough precision, the post-Newton rounding logic
            // could be applied directly.)

            const guess = BigDecimal.fromValue(Math.sqrt(working.numberValue()));
            let guessPrecision = 15;
            const originalPrecision = mc.precision;
            let targetPrecision;

            // If an exact value is requested, it must only need about
            // half of the input digits to represent since multiplying
            // an N digit number by itself yield a 2N-1 digit or 2N
            // digit result.
            if (originalPrecision === 0) {
                targetPrecision = Math.trunc(stripped.precision() / 2) + 1;
            } else {
                /*
                 * To avoid the need for post-Newton fix-up logic, in
                 * the case of half-way rounding modes, double the
                 * target precision so that the "2p + 2" property can
                 * be relied on to accomplish the final rounding.
                 */
                switch (mc.roundingMode) {
                case RoundingMode.HALF_UP:
                case RoundingMode.HALF_DOWN:
                case RoundingMode.HALF_EVEN:
                    targetPrecision = 2 * originalPrecision;
                    if (targetPrecision < 0)
                        targetPrecision = Number.MAX_SAFE_INTEGER - 2;
                    break;

                default:
                    targetPrecision = originalPrecision;
                    break;
                }
            }

            // When setting the precision to use inside the Newton
            // iteration loop, take care to avoid the case where the
            // precision of the input exceeds the requested precision
            // and rounding the input value too soon.
            let approx = guess;
            const workingPrecision = working.precision();
            do {
                const tmpPrecision = Math.max(Math.max(guessPrecision, targetPrecision + 2), workingPrecision);
                const mcTmp = new MathContext(tmpPrecision, RoundingMode.HALF_EVEN);
                // approx = 0.5 * (approx + fraction / approx)
                approx = BigDecimal.ONE_HALF.multiply(approx.add(working.divideWithMathContext(approx, mcTmp), mcTmp));
                guessPrecision *= 2;
            } while (guessPrecision < targetPrecision + 2);

            let result;
            const targetRm = mc.roundingMode;
            if (targetRm === RoundingMode.UNNECESSARY || originalPrecision === 0) {
                const tmpRm = (targetRm === RoundingMode.UNNECESSARY) ? RoundingMode.DOWN : targetRm;
                const mcTmp = new MathContext(targetPrecision, tmpRm);
                result = approx.scaleByPowerOfTen(Math.trunc(-scaleAdjust / 2)).round(mcTmp);

                // If result*result != this numerically, the square
                // root isn't exact
                if (this.subtract(result.square()).compareTo(BigDecimal.ZERO) !== 0) {
                    throw new RangeError('Computed square root not exact.');
                }
            } else {
                result = approx.scaleByPowerOfTen(Math.trunc(-scaleAdjust / 2)).round(mc);

                switch (targetRm) {
                case RoundingMode.DOWN:
                case RoundingMode.FLOOR:
                    // Check if too big
                    if (result.square().compareTo(this) > 0) {
                        let ulp = result.ulp();
                        // Adjust increment down in case of 1.0 = 10^0
                        // since the next smaller number is only 1/10
                        // as far way as the next larger at exponent
                        // boundaries. Test approx and *not* result to
                        // avoid having to detect an arbitrary power
                        // of ten.
                        if (approx.compareTo(BigDecimal.ONE) === 0) {
                            ulp = ulp.multiply(BigDecimal.ONE_TENTH);
                        }
                        result = result.subtract(ulp);
                    }
                    break;

                case RoundingMode.UP:
                case RoundingMode.CEILING:
                    // Check if too small
                    if (result.square().compareTo(this) < 0) {
                        result = result.add(result.ulp());
                    }
                    break;

                default:
                    // No additional work, rely on "2p + 2" property
                    // for correct rounding. Alternatively, could
                    // instead run the Newton iteration to around p
                    // digits and then do tests and fix-ups on the
                    // rounded value. One possible set of tests and
                    // fix-ups is given in the Hull and Abrham paper;
                    // however, additional half-way cases can occur
                    // for BigDecimal given the more varied
                    // combinations of input and output precisions
                    // supported.
                    break;
                }

            }
            if (result._scale !== preferredScale) {
                // The preferred scale of an add is
                // max(addend.scale(), augend.scale()). Therefore, if
                // the scale of the result is first minimized using
                // stripTrailingZeros(), adding a zero of the
                // preferred scale rounding to the correct precision
                // will perform the proper scale vs precision
                // tradeoffs.
                result = result.stripTrailingZeros().add(zeroWithFinalPreferredScale,
                    new MathContext(originalPrecision, RoundingMode.UNNECESSARY));
            }
            return result;
        }
    }

    /** @internal */
    private square(): BigDecimal {
        return this.multiply(this);
    }

    /**
     * Returns the size of an ulp, a unit in the last place, of this
     * `BigDecimal`.  An ulp of a nonzero `BigDecimal`
     * value is the positive distance between this value and the
     * `BigDecimal` value next larger in magnitude with the
     * same number of digits.  An ulp of a zero value is numerically
     * equal to 1 with the scale of `this`.  The result is
     * stored with the same scale as `this` so the result
     * for zero and nonzero values is equal to `[1, this.scale()]`.
     *
     * @return the size of an ulp of `this`
     */
    ulp(): BigDecimal {
        return BigDecimal.fromInteger2(1, this._scale, 1);
    }

    /**
     * Returns signum of a bigint. If negative -1 returned, if positive 1 returned, if zero 0 returned.
     * @param val
     * @internal
     */
    private static bigIntSignum(val: BigInt): number {
        return val > BigDecimal.zeroBigInt ? 1 : (val < BigDecimal.zeroBigInt ? -1 : 0);
    }

    /**
     * Returns a `BigDecimal` which is numerically equal to
     * this one but with any trailing zeros removed from the
     * representation.  For example, stripping the trailing zeros from
     * the `BigDecimal` value `600.0`, which has
     * [`BigInt`, `scale`] components equal to
     * [6000n, 1], yields `6E2` with [`BigInt`, `scale`]
     * components equal to [6n, -2].
     *
     * @return a numerically equal `BigDecimal` with any
     * trailing zeros removed.
     * @throws RangeError if scale from max or min safe integer range.
     */
    stripTrailingZeros(): BigDecimal {
        if (this.intCompact === 0 || (this.intVal !== null && BigDecimal.bigIntSignum(this.intVal!) === 0)) {
            return BigDecimal.ZERO;
        } else if (this.intCompact !== BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(this.intCompact, this._scale, Number.MIN_SAFE_INTEGER);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(this.intVal!, this._scale, Number.MIN_SAFE_INTEGER);
        }
    }

    /**
     * Returns whether this `BigDecimal` is a power of ten(negative or positive).
     * @internal
     */
    private isPowerOfTen(): boolean {
        return this.unscaledValue() === BigDecimal.oneBigInt;
    }

    /**
     * Returns a `BigInt` whose value is the <i>unscaled
     * value</i> of this `BigDecimal`.  (Computes <code>(this *
     * 10<sup>this.scale()</sup>)</code>.)
     *
     * @return the unscaled value of this `BigDecimal`.
     */
    unscaledValue(): BigInt {
        return this.inflated();
    }

    /**
     * Returns the <i>scale</i> of this `BigDecimal`.  If zero
     * or positive, the scale is the number of digits to the right of
     * the decimal point.  If negative, the unscaled value of the
     * number is multiplied by ten to the power of the negation of the
     * scale.  For example, a scale of `-3` means the unscaled
     * value is multiplied by 1000.
     *
     * The scale will be kept in the integer range, if cannot error will be thrown.
     *
     * @return the scale of this `BigDecimal`.
     */
    scale(): number {
        return this._scale;
    }

    /**
     * Returns a BigDecimal whose numerical value is equal to
     * (`this` * 10<sup>n</sup>).  The scale of
     * the result is `(this.scale() - n)`.
     *
     * @param n the exponent power of ten to scale by
     * @return a BigDecimal whose numerical value is equal to
     * (`this` * 10<sup>n</sup>)
     * @throws RangeError if the scale would be outside the range of a safe integer.
     */
    scaleByPowerOfTen(n: number): BigDecimal {
        return new BigDecimal(this.intVal, this.intCompact, this.checkScale(this._scale - n), this._precision);
    }

    /**
     * Compares this `BigDecimal` numerically with the specified
     * `BigDecimal`.  Two `BigDecimal` objects that are
     * equal in value but have a different scale (like 2.0 and 2.00)
     * are considered equal by this method. Such values are in the
     * same <i>cohort</i>.
     *
     * This method is provided in preference to individual methods for
     * each of the six boolean comparison operators (`<`, `==`,
     * `>`, `>=`, `!=`, `<=`).  The suggested
     * idiom for performing these comparisons is:
     * (x.compareTo(y) &lt;<i>op</i>&gt; 0), where
     * &lt;<i>op</i>&gt; is one of the six comparison operators.

     * @param val value to which this `BigDecimal` is to be compared.
     * This value will be converted to a `BigDecimal` before the operation.
     * See the {@link Big | constructor} to learn more about the conversion.
     * @return -1, 0, or 1 as this `BigDecimal` is numerically
     *          less than, equal to, or greater than `val`.
     */
    compareTo(val: any): number {
        val = BigDecimal.convertToBigDecimal(val);
        // Quick path for equal scale and non-inflated case.
        if (this._scale === val._scale) {
            const xs = this.intCompact;
            const ys = val.intCompact;
            if (xs !== BigDecimal.INFLATED && ys !== BigDecimal.INFLATED) {
                return xs !== ys ? (xs > ys ? 1 : -1) : 0;
            }
        }

        const xsign = this.signum();
        const ysign = val.signum();
        if (xsign !== ysign) {
            return xsign > ysign ? 1 : -1;
        } else if (xsign === 0) {
            return 0;
        } else {
            const cmp = this.compareMagnitude(val);
            return xsign > 0 ? cmp : -cmp;
        }
    }

    /**
     * Converts this BigDecimal to number.
     * @return number for of this BigDecimal
     */
    numberValue(): number {
        if (this.intCompact !== BigDecimal.INFLATED) {
            if (this._scale === 0) {
                return this.intCompact;
            } else {
                /*
                 * If both intCompact and the scale can be exactly
                 * represented as double values, perform a single
                 * double multiply or divide to compute the (properly
                 * rounded) result.
                 */
                if (Math.abs(this.intCompact) < Number.MAX_SAFE_INTEGER) {
                    // Don't have too guard against
                    // Math.abs(MIN_VALUE) because of outer check
                    // against INFLATED.
                    if (this._scale > 0 && this._scale <= BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact / BigDecimal.NUMBER_10_POW[this._scale];
                    } else if (this._scale < 0 && this._scale >= -BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact * BigDecimal.NUMBER_10_POW[-this._scale];
                    }
                }
            }
        }
        // Somewhat inefficient, but guaranteed to work.
        return Number(this.toString());
    }

    /**
     * Returns a `BigDecimal` rounded according to the
     * `MathContext` settings.  If the precision setting is 0 then
     * no rounding takes place.
     *
     * The effect of this method is identical to that of the
     * {@link plus} method.
     *
     * @param mc the context to use.
     * @return a `BigDecimal` rounded according to the
     *         `MathContext` settings.
     * @see    {@link plus}
     */
    round(mc: MathContext): BigDecimal {
        return this.plus(mc);
    }

    /**
     * Returns a `BigDecimal` whose scale is the specified
     * value, and whose unscaled value is determined by multiplying or
     * dividing this `BigDecimal`'s unscaled value by the
     * appropriate power of ten to maintain its overall value.  If the
     * scale is reduced by the operation, the unscaled value must be
     * divided (rather than multiplied), and the value may be changed;
     * in this case, the specified rounding mode is applied to the
     * division.
     *
     *
     * @param newScale scale of the `BigDecimal` value to be returned.
     * @param roundingMode The rounding mode to apply. By default it is set to `UNNECESSARY`.
     * @return a `BigDecimal` whose scale is the specified value,
     *         and whose unscaled value is determined by multiplying or
     *         dividing this `BigDecimal`'s unscaled value by the
     *         appropriate power of ten to maintain its overall value.
     * @throws RangeError if roundingMode is `UNNECESSARY`
     *         and the specified scaling operation would require
     *         rounding.
     * @see {@link RoundingMode}
     */
    setScale(newScale: number, roundingMode: RoundingMode = RoundingMode.UNNECESSARY): BigDecimal {
        if (roundingMode < RoundingMode.UP || roundingMode > RoundingMode.UNNECESSARY)
            throw new RangeError('Invalid rounding mode');

        const oldScale = this._scale;
        if (newScale === oldScale) // easy case
            return this;
        if (this.signum() === 0) // zero can have any scale
            return BigDecimal.zeroValueOf(newScale);
        if (this.intCompact !== BigDecimal.INFLATED) {
            let rs = this.intCompact;
            if (newScale > oldScale) {
                const raise = this.checkScale(newScale - oldScale);
                if ((rs = BigDecimal.integerMultiplyPowerTen(rs, raise)) !== BigDecimal.INFLATED) {
                    return BigDecimal.fromInteger3(rs, newScale);
                }
                const rb = this.bigMultiplyPowerTen(raise);
                return new BigDecimal(
                    rb, BigDecimal.INFLATED, newScale, (this._precision > 0) ? this._precision + raise : 0
                );
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                const drop = this.checkScale(oldScale - newScale);
                if (drop < BigDecimal.TEN_POWERS_TABLE.length) {
                    return BigDecimal.divideAndRound2(
                        rs, BigDecimal.TEN_POWERS_TABLE[drop], newScale, roundingMode, newScale
                    );
                } else {
                    return BigDecimal.divideAndRound3(
                        this.inflated(), BigInt(10) ** BigInt(drop), newScale, roundingMode, newScale
                    );
                }
            }
        } else {
            if (newScale > oldScale) {
                const raise = this.checkScale(newScale - oldScale);
                const rb = BigDecimal.bigMultiplyPowerTen3(this.intVal!, raise);
                return new BigDecimal(
                    rb, BigDecimal.INFLATED, newScale, (this._precision > 0) ? this._precision + raise : 0
                );
            } else {
                // newScale < oldScale -- drop some digits
                // Can't predict the precision due to the effect of rounding.
                const drop = this.checkScale(oldScale - newScale);
                if (drop < BigDecimal.TEN_POWERS_TABLE.length)
                    return BigDecimal.divideAndRound4(
                        this.intVal!, BigDecimal.TEN_POWERS_TABLE[drop], newScale, roundingMode, newScale
                    );
                else
                    return BigDecimal.divideAndRound3(
                        this.intVal!, BigInt(10) ** BigInt(drop), newScale, roundingMode, newScale
                    );
            }
        }
    }

    /**
     * Returns a `BigDecimal` whose value is `(+this)`,
     * with rounding according to the context settings.
     *
     * The effect of this method is identical to that of the {@link round} method.
     *
     * @param mc the context to use.
     * @return `this`, rounded as necessary.  A zero result will
     *         have a scale of 0.
     * @see    {@link round}
     */
    plus(mc?: MathContext): BigDecimal {
        if (!mc) return this;
        if (mc.precision === 0) // no rounding please
            return this;
        return BigDecimal.doRound(this, mc);
    }

    /**
     * Returns a `BigDecimal` whose value is
     * <code>(this<sup>n</sup>)</code>.  The current implementation uses
     * the core algorithm defined in ANSI standard X3.274-1996 with
     * rounding according to the context settings.  In general, the
     * returned numerical value is within two ulps of the exact
     * numerical value for the chosen precision.
     *
     * The X3.274-1996 algorithm is:
     *
     * * An `RangeError` exception is thrown if
     *     * `abs(n)` > 999999999}
     *     * `mc.precision == 0` and `n < 0`
     *     * `mc.precision > 0` and `n` has more than
     *    `mc.precision` decimal digits
     *
     * * if `n` is zero, a BigDecimal with value 1 is returned even if
     * `this` is zero, otherwise

     *     * if `n` is positive, the result is calculated via
     *   the repeated squaring technique into a single accumulator.
     *   The individual multiplications with the accumulator use the
     *   same math context settings as in `mc` except for a
     *   precision increased to `mc.precision + elength + 1`
     *   where `elength` is the number of decimal digits in
     *   `n`.
     *
     *     * if `n` is negative, the result is calculated as if
     *   `n` were positive; this value is then divided into one
     *   using the working precision specified above.
     *
     *     * The final value from either the positive or negative case
     *   is then rounded to the destination precision.
     *
     * @param n power to raise this `BigDecimal` to.
     * @param mc the context to use.
     * @return <code>this<sup>n</sup></code> using the ANSI standard X3.274-1996
     *         algorithm
     * @throws RangeError if the result is inexact but the
     *         rounding mode is `UNNECESSARY`, or `n` is out
     *         of range.
     */
    pow(n: number, mc?: MathContext): BigDecimal {
        if (!mc || (mc && mc.precision === 0)) {
            if (n < 0 || n > 999999999)
                throw new RangeError('Invalid operation');
            // No need to calculate pow(n) if result will over/underflow.
            // Don't attempt to support "supernormal" numbers.
            const newScale = this.checkScale(this._scale * n);
            return BigDecimal.fromBigInt5(this.inflated().valueOf() ** BigInt(n), newScale, 0);
        }
        if (n < -999999999 || n > 999999999)
            throw new RangeError('Invalid operation');
        if (n === 0) // x**0 == 1 in X3.274
            return BigDecimal.ONE;
        let workmc = mc; // working settings
        let mag = Math.abs(n); // magnitude of n
        if (mc.precision > 0) {
            const elength = BigDecimal.integerDigitLength(mag); // length of n in digits
            if (elength > mc.precision) // X3.274 rule
                throw new RangeError('Invalid operation');
            workmc = new MathContext(mc.precision + elength + 1, mc.roundingMode);
        }
        // ready to carry out power calculation...
        let acc = BigDecimal.ONE; // accumulator
        let seenbit = false; // set once we've seen a 1-bit
        for (let i = 1; ; i++) { // for each bit [top bit ignored]
            mag <<= 1; // shift left 1 bit
            if (mag < 0) { // top bit is set
                seenbit = true; // OK, we're off
                acc = acc.multiply(this, workmc); // acc=acc*x
            }
            if (i === 31)
                break; // that was the last bit
            if (seenbit)
                acc = acc.multiply(acc, workmc); // acc=acc*acc [square]
            // else (!seenbit) no point in squaring ONE
        }
        // if negative n, calculate the reciprocal using working precision
        if (n < 0) // [hence mc.precision>0]
            acc = BigDecimal.ONE.divideWithMathContext(acc, workmc);
        // round to final precision and strip zeros
        return BigDecimal.doRound(acc, mc);
    }

    /**
     * Returns a `BigDecimal` whose value is the absolute value
     * of this `BigDecimal`, with rounding according to the
     * context settings.
     *
     * @param mc the context to use.
     * @return absolute value, rounded as necessary.
     */
    abs(mc?: MathContext): BigDecimal {
        return this.signum() < 0 ? this.negate(mc) : this.plus(mc);
    }

    /**
     * Internally used for division operation for division `number`
     * by `number`.
     * The returned `BigDecimal` object is the quotient whose scale is set
     * to the passed in scale. If the remainder is not zero, it will be rounded
     * based on the passed in roundingMode. Also, if the remainder is zero and
     * the last parameter, i.e. preferredScale is NOT equal to scale, the
     * trailing zeros of the result is stripped to match the preferredScale.
     * @internal
     */
    private static divideAndRound2(
        ldividend: number, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        const q = Math.trunc(ldividend / ldivisor);
        if (roundingMode === RoundingMode.DOWN && scale === preferredScale)
            return BigDecimal.fromInteger3(q, scale);
        const r = ldividend % ldivisor;
        const qsign = ((ldividend < 0) === (ldivisor < 0)) ? 1 : -1; // quotient sign
        if (r !== 0) {
            const increment = BigDecimal.needIncrement(ldivisor, roundingMode, qsign, q, r);
            return BigDecimal.fromInteger3((increment ? q + qsign : q), scale);
        } else {
            if (preferredScale !== scale)
                return BigDecimal.createAndStripZerosToMatchScale(q, scale, preferredScale);
            else
                return BigDecimal.fromInteger3(q, scale);
        }
    }

    /**
     * Tests if quotient has to be incremented according the roundingMode
     * @internal
     */
    private static needIncrement(ldivisor: number, roundingMode: RoundingMode, qsign: number, q: number, r: number) {
        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1; // 2 * r can't fit into long
        } else {
            cmpFracHalf = BigDecimal.integerCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, (q & 1) !== 0);
    }

    /**
     * Shared logic of need increment computation.
     * @internal
     */
    private static commonNeedIncrement(
        roundingMode: RoundingMode, qsign: number, cmpFracHalf: number, oddQuot: boolean
    ): boolean {
        switch (roundingMode) {
        case RoundingMode.UNNECESSARY:
            throw new RangeError('Rounding necessary');

        case RoundingMode.UP: // Away from zero
            return true;

        case RoundingMode.DOWN: // Towards zero
            return false;

        case RoundingMode.CEILING: // Towards +infinity
            return qsign > 0;

        case RoundingMode.FLOOR: // Towards -infinity
            return qsign < 0;

        default: // Some kind of half-way rounding
            if (cmpFracHalf < 0) // We're closer to higher digit
                return false;
            else if (cmpFracHalf > 0) // We're closer to lower digit
                return true;
            else { // half-way
                switch (roundingMode) {
                case RoundingMode.HALF_DOWN:
                    return false;

                case RoundingMode.HALF_UP:
                    return true;

                case RoundingMode.HALF_EVEN:
                    return oddQuot;

                default:
                    throw new RangeError(`Unexpected rounding mode ${RoundingMode[roundingMode]}`);
                }
            }
        }
    }

    /** @internal */
    private static integerCompareMagnitude(x: number, y: number): number {
        if (x < 0)
            x = -x;
        if (y < 0)
            y = -y;
        return (x < y) ? -1 : ((x === y) ? 0 : 1);
    }

    /**
     * Compares magnitudes of two bigints if x < y returns -1, if equal 0 if x > y, 1.
     * @param x
     * @param y
     * @internal
     */
    private static bigIntCompareMagnitude(x: BigInt, y: BigInt): number {
        if (x < BigDecimal.zeroBigInt)
            x = BigDecimal.minusOneBigInt * x.valueOf();
        if (y < BigDecimal.zeroBigInt)
            y = BigDecimal.minusOneBigInt * y.valueOf();
        return (x < y) ? -1 : ((x === y) ? 0 : 1);
    }

    /**
     * Converts a bigint to bigdecimal
     * @param bigInt bigint
     * @param qsign sign
     * @param scale scale
     * @internal
     */
    private static bigIntToBigDecimal(bigInt: BigInt, qsign: number, scale: number): BigDecimal {
        if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER) && bigInt >= BigInt(Number.MIN_SAFE_INTEGER)) {
            const numberForm = Number(bigInt);
            return new BigDecimal(null, qsign * numberForm, scale, 0);
        } else {
            return new BigDecimal(
                BigInt(qsign) * bigInt.valueOf(), BigDecimal.INFLATED, scale, 0
            );
        }
    }

    /**
     * Converts a bigint to number, returns INFLATED if it won't be a safe integer
     * @param bigInt bigint
     * @param qsign sign number
     * @internal
     */
    private static bigIntToCompactValue(bigInt: BigInt, qsign: number): number {
        if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER) && bigInt >= BigInt(Number.MIN_SAFE_INTEGER)) {
            return qsign * Number(bigInt);
        } else {
            return BigDecimal.INFLATED;
        }
    }

    /**
     * Internally used for division operation for division `BigInt`
     * by `BigInt`.
     * The returned `BigDecimal` object is the quotient whose scale is set
     * to the passed in scale. If the remainder is not zero, it will be rounded
     * based on the passed in roundingMode. Also, if the remainder is zero and
     * the last parameter, i.e. preferredScale is NOT equal to scale, the
     * trailing zeros of the result is stripped to match the preferredScale.
     * @internal
     */
    private static divideAndRound3(
        bdividend: BigInt, bdivisor: BigInt, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        // quotient sign
        const qsign = (BigDecimal.bigIntSignum(bdividend) !== BigDecimal.bigIntSignum(bdivisor)) ? -1 : 1;

        if (bdividend < BigDecimal.zeroBigInt) bdividend = bdividend.valueOf() * BigDecimal.minusOneBigInt;
        if (bdivisor < BigDecimal.zeroBigInt) bdivisor = bdivisor.valueOf() * BigDecimal.minusOneBigInt;

        let mq = bdividend.valueOf() / bdivisor.valueOf();
        const mr = bdividend.valueOf() % bdivisor.valueOf();
        // record remainder is zero or not
        const isRemainderZero = mr === BigDecimal.zeroBigInt;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement2(bdivisor, roundingMode, qsign, mq, mr)) {
                mq += BigDecimal.oneBigInt;
            }
            return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
        } else {
            if (preferredScale !== scale) {
                const compactVal = BigDecimal.bigIntToCompactValue(mq, qsign);
                if (compactVal !== BigDecimal.INFLATED) {
                    return BigDecimal.createAndStripZerosToMatchScale(compactVal, scale, preferredScale);
                }
                const intVal = BigInt(qsign) * mq.valueOf();
                return BigDecimal.createAndStripZerosToMatchScale2(intVal, scale, preferredScale);
            } else {
                return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
            }
        }
    }

    /**
     * Tests if quotient has to be incremented according the roundingMode
     * @internal
     */
    private static needIncrement2(
        mdivisor: BigInt, roundingMode: RoundingMode, qsign: number, mq: BigInt, mr: BigInt
    ): boolean {
        const cmpFracHalf = BigDecimal.compareHalf(mr, mdivisor);
        return BigDecimal.commonNeedIncrement(
            roundingMode, qsign, cmpFracHalf, mq.valueOf() % BigDecimal.twoBigInt === BigDecimal.oneBigInt
        );
    }

    /**
     * Compares half of second with first
     * @param first
     * @param second
     * @private
     */
    private static compareHalf(first: BigInt, second: BigInt): number {
        second = second.valueOf() / BigDecimal.twoBigInt;
        if (first < second) return -1;
        if (first > second) return 1;
        return 0;
    }

    /**
     * Internally used for division operation for division `BigInt`
     * by `number`.
     * The returned `BigDecimal` object is the quotient whose scale is set
     * to the passed in scale. If the remainder is not zero, it will be rounded
     * based on the passed in roundingMode. Also, if the remainder is zero and
     * the last parameter, i.e. preferredScale is NOT equal to scale, the
     * trailing zeros of the result is stripped to match the preferredScale.
     * @internal
     */
    private static divideAndRound4(
        bdividend: BigInt, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        const divisorNegative = ldivisor < 0;
        const dividendSignum = BigDecimal.bigIntSignum(bdividend);

        if (divisorNegative) ldivisor *= -1;
        if (dividendSignum === -1) bdividend = bdividend.valueOf() * BigDecimal.minusOneBigInt;

        let mq = bdividend.valueOf() / BigInt(ldivisor);
        let mr: number;

        const bDividendNumber = Number(bdividend);

        if (Number.isSafeInteger(bDividendNumber)) {
            mr = bDividendNumber % ldivisor;
        } else {
            mr = Number(bdividend.valueOf() % BigInt(ldivisor));
        }

        // record remainder is zero or not
        const isRemainderZero = mr === 0;
        // quotient sign
        const qsign = divisorNegative ? -dividendSignum : dividendSignum;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement3(ldivisor, roundingMode, qsign, mq, mr)) {
                mq += BigDecimal.oneBigInt;
            }
            return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
        } else {
            if (preferredScale !== scale) {
                const compactVal = BigDecimal.bigIntToCompactValue(mq, qsign);
                if (compactVal !== BigDecimal.INFLATED) {
                    return BigDecimal.createAndStripZerosToMatchScale(compactVal, scale, preferredScale);
                }
                const intVal = BigInt(qsign) * mq.valueOf();
                return BigDecimal.createAndStripZerosToMatchScale2(intVal, scale, preferredScale);
            } else {
                return BigDecimal.bigIntToBigDecimal(mq, qsign, scale);
            }
        }
    }

    /**
     * Tests if quotient has to be incremented according the roundingMode
     * @internal
     */
    private static needIncrement3(ldivisor: number, roundingMode: RoundingMode, qsign: number, mq: BigInt, r: number) {
        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1;
        } else {
            cmpFracHalf = BigDecimal.integerCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(
            roundingMode, qsign, cmpFracHalf, mq.valueOf() % BigDecimal.twoBigInt === BigDecimal.oneBigInt
        );
    }

    /**
     * Returns a `BigDecimal` which is equivalent to this one
     * with the decimal point moved `n` places to the left.  If
     * `n` is non-negative, the call merely adds `n` to
     * the scale.  If `n` is negative, the call is equivalent
     * to `movePointRight(-n)`.  The `BigDecimal`
     * returned by this call has value <code>(this &times;
     * 10<sup>-n</sup>)</code> and scale `max(this.scale()+n,
     * 0)`.
     *
     * @param n number of places to move the decimal point to the left.
     * @return a `BigDecimal` which is equivalent to this one with the
     *         decimal point moved `n` places to the left.
     * @throws RangeError if scale overflows.
     */
    movePointLeft(n: number): BigDecimal {
        if (n === 0) return this;

        // Cannot use movePointRight(-n) in case of n==BigDecimal.MIN_INT_VALUE
        const newScale = this.checkScale(this._scale + n);
        const num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num._scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    /**
     * Returns a `BigDecimal` which is equivalent to this one
     * with the decimal point moved `n` places to the right.
     * If `n` is non-negative, the call merely subtracts
     * `n` from the scale.  If `n` is negative, the call
     * is equivalent to `movePointLeft(-n)`.  The
     * `BigDecimal` returned by this call has value <code>(this
     * &times; 10<sup>n</sup>)</code> and scale `max(this.scale()-n, 0)`.
     *
     * @param n number of places to move the decimal point to the right.
     * @return a `BigDecimal` which is equivalent to this one
     *         with the decimal point moved `n` places to the right.
     * @throws RangeError if scale overflows.
     */
    movePointRight(n: number): BigDecimal {
        if (n === 0) return this;

        // Cannot use movePointLeft(-n) in case of n==BigDecimal.MIN_INT_VALUE
        const newScale = this.checkScale(this._scale - n);
        const num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num._scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    /**
     * Returns the minimum of this `BigDecimal` and `val`.
     *
     * @param val value with which the minimum is to be computed.
     * @return the `BigDecimal` whose value is the lesser of this
     *         `BigDecimal` and `val`.  If they are equal,
     *         as defined by the {@link compareTo}
     *         method, `this` is returned.
     * @see    {@link compareTo}
     */
    min(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) <= 0 ? this : val);
    }

    /**
     * Returns the maximum of this `BigDecimal` and `val`.
     *
     * @param val value with which the maximum is to be computed.
     * @return the `BigDecimal` whose value is the greater of this
     *         `BigDecimal` and `val`.  If they are equal,
     *         as defined by the {@link compareTo}
     *         method, `this` is returned.
     * @see    {@link compareTo}
     */
    max(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) >= 0 ? this : val);
    }

    /**
     * Returns the string representation of this `BigDecimal`,
     * using scientific notation if an exponent is needed.
     *
     * A standard canonical string form of the `BigDecimal`
     * is created as though by the following steps: first, the
     * absolute value of the unscaled value of the `BigDecimal`
     * is converted to a string in base ten using the characters
     * '0' through '9' with no leading zeros (except
     * if its value is zero, in which case a single '0'
     * character is used).
     *
     * Next, an <i>adjusted exponent</i> is calculated; this is the
     * negated scale, plus the number of characters in the converted
     * unscaled value, less one.  That is,
     * `-scale+(ulength-1)`, where `ulength` is the
     * length of the absolute value of the unscaled value in decimal
     * digits (its <i>precision</i>).
     *
     * If the scale is greater than or equal to zero and the
     * adjusted exponent is greater than or equal to `-6`, the
     * number will be converted to a character form without using
     * exponential notation.  In this case, if the scale is zero then
     * no decimal point is added and if the scale is positive a
     * decimal point will be inserted with the scale specifying the
     * number of characters to the right of the decimal point.
     * '0' characters are added to the left of the converted
     * unscaled value as necessary.  If no character precedes the
     * decimal point after this insertion then a conventional
     * '0' character is prefixed.
     *
     * Otherwise (that is, if the scale is negative, or the
     * adjusted exponent is less than `-6`), the number will be
     * converted to a character form using exponential notation.  In
     * this case, if the converted `BigInt` has more than
     * one digit a decimal point is inserted after the first digit.
     * An exponent in character form is then suffixed to the converted
     * unscaled value (perhaps with inserted decimal point); this
     * comprises the letter 'E' followed immediately by the
     * adjusted exponent converted to a character form.  The latter is
     * in base ten, using the characters '0' through
     * '9' with no leading zeros, and is always prefixed by a
     * sign character '-' (<code>'&#92;u002D'</code>) if the
     * adjusted exponent is negative, '+'
     * (<code>'&#92;u002B'</code>) otherwise).
     *
     * Finally, the entire string is prefixed by a minus sign
     * character '-' (<code>'&#92;u002D'</code>) if the unscaled
     * value is less than zero.  No sign character is prefixed if the
     * unscaled value is zero or positive.
     *
     * **Examples:**
     * For each representation [<i>unscaled value</i>, <i>scale</i>]
     * on the left, the resulting string is shown on the right.
     * <pre>
     * [123,0]      "123"
     * [-123,0]     "-123"
     * [123,-1]     "1.23E+3"
     * [123,-3]     "1.23E+5"
     * [123,1]      "12.3"
     * [123,5]      "0.00123"
     * [123,10]     "1.23E-8"
     * [-123,12]    "-1.23E-10"
     * </pre>
     *
     * **Notes:**
     *
     * * There is a one-to-one mapping between the distinguishable
     * `BigDecimal` values and the result of this conversion.
     * That is, every distinguishable `BigDecimal` value
     * (unscaled value and scale) has a unique string representation
     * as a result of using `toString`.  If that string
     * representation is converted back to a `BigDecimal` using
     * the string constructor, then the original
     * value will be recovered.
     *
     * * The {@link toEngineeringString} method may be used for
     * presenting numbers with exponents in engineering notation, and the
     * {@link setScale} method may be used for
     * rounding a `BigDecimal` so it has a known number of digits after
     * the decimal point.
     *
     * @return string representation of this `BigDecimal`.
     */
    toString(): string {
        let sc = this.stringCache;
        if (sc === undefined) {
            this.stringCache = sc = this.layoutString(true);
        }
        return sc;
    }

    /**
     * Returns a string representation of this `BigDecimal`,
     * using engineering notation if an exponent is needed.
     *
     * Returns a string that represents the `BigDecimal` as
     * described in the {@link toString} method, except that if
     * exponential notation is used, the power of ten is adjusted to
     * be a multiple of three (engineering notation) such that the
     * integer part of nonzero values will be in the range 1 through
     * 999.  If exponential notation is used for zero values, a
     * decimal point and one or two fractional zero digits are used so
     * that the scale of the zero value is preserved.  Note that
     * unlike the output of {@link toString}, the output of this
     * method is <em>not</em> guaranteed to recover the same [number,
     * scale] pair of this `BigDecimal` if the output string is
     * converting back to a `BigDecimal` using the string constructor.
     * The result of this method meets the weaker constraint of always producing a numerically equal
     * result from applying the string constructor to the method's output.
     *
     * @return string representation of this `BigDecimal`, using
     *         engineering notation if an exponent is needed.
     */
    toEngineeringString(): string {
        return this.layoutString(false);
    }

    /**
     * Returns absolute value of a bigint
     * @internal
     */
    private static bigIntAbs(val: BigInt) {
        if (val < BigDecimal.zeroBigInt) {
            return val.valueOf() * BigDecimal.minusOneBigInt;
        } else return val;
    }

    /**
     * Lay out this `BigDecimal` into a string.
     *
     * @param sci `true` for Scientific exponential notation;
     *            `false` for Engineering
     * @return string with canonical string representation of this
     * `BigDecimal`
     * @internal
     */
    private layoutString(sci: boolean): string {
        if (this._scale === 0) // zero scale is trivial
            return (this.intCompact !== BigDecimal.INFLATED) ? this.intCompact.toString() : this.intVal!.toString();

        if (this._scale === 2 && this.intCompact >= 0 && this.intCompact < Number.MAX_SAFE_INTEGER) {
            // currency fast path
            const lowInt = this.intCompact % 100;
            const highInt = Math.trunc(this.intCompact / 100);
            return (highInt.toString() + '.' + BigDecimal.DIGIT_TENS[lowInt] + BigDecimal.DIGIT_ONES[lowInt]);
        }

        let coeff;
        const offset = 0; // offset is the starting index for coeff array
        // Get the significand as an absolute value
        if (this.intCompact !== BigDecimal.INFLATED) {
            coeff = Math.abs(this.intCompact).toString();
        } else {
            coeff = BigDecimal.bigIntAbs(this.intVal!).toString();
        }

        // Construct a string.
        let str = '';
        if (this.signum() < 0) // prefix '-' if negative
            str += '-';
        const coeffLen = coeff.length - offset;
        let adjusted = -this._scale + (coeffLen - 1);
        if ((this._scale >= 0) && (adjusted >= -6)) { // plain number
            let pad = this._scale - coeffLen; // count of padding zeros
            if (pad >= 0) { // 0.xxx form
                str += '0';
                str += '.';
                for (; pad > 0; pad--) {
                    str += '0';
                }
                str += coeff.substr(offset, coeffLen);
            } else { // xx.xx form
                str += coeff.substr(offset, -pad);
                str += '.';
                str += coeff.substr(-pad + offset, this._scale);
            }
        } else { // E-notation is needed
            if (sci) { // Scientific notation
                str += coeff[offset]; // first character
                if (coeffLen > 1) { // more to come
                    str += '.';
                    str += coeff.substr(offset + 1, coeffLen - 1);
                }
            } else { // Engineering notation
                let sig = (adjusted % 3);
                if (sig < 0)
                    sig += 3; // [adjusted was negative]
                adjusted -= sig; // now a multiple of 3
                sig++;
                if (this.signum() === 0) {
                    switch (sig) {
                    case 1:
                        str += '0'; // exponent is a multiple of three
                        break;
                    case 2:
                        str += '0.00';
                        adjusted += 3;
                        break;
                    case 3:
                        str += '0.0';
                        adjusted += 3;
                        break;
                    default:
                        throw new RangeError('Unexpected sig value ' + sig);
                    }
                } else if (sig >= coeffLen) { // significand all in integer
                    str += coeff.substr(offset, coeffLen);
                    // may need some zeros, too
                    for (let i = sig - coeffLen; i > 0; i--) {
                        str += '0';
                    }
                } else { // xx.xxE form
                    str += coeff.substr(offset, sig);
                    str += '.';
                    str += coeff.substr(offset + sig, coeffLen - sig);
                }
            }
            if (adjusted !== 0) { // [!sci could have made 0]
                str += 'E';
                if (adjusted > 0) // force sign for positive
                    str += '+';
                str += adjusted.toString();
            }
        }
        return str;
    }

    /**
     * Returns a string representation of this `BigDecimal`
     * without an exponent field.  For values with a positive scale,
     * the number of digits to the right of the decimal point is used
     * to indicate scale.  For values with a zero or negative scale,
     * the resulting string is generated as if the value were
     * converted to a numerically equal value with zero scale and as
     * if all the trailing zeros of the zero scale value were present
     * in the result.
     *
     * The entire string is prefixed by a minus sign character '-'
     * (<code>'&#92;u002D'</code>) if the unscaled value is less than
     * zero. No sign character is prefixed if the unscaled value is
     * zero or positive.
     *
     * Note that if the result of this method is passed to the
     * string constructor, only the
     * numerical value of this `BigDecimal` will necessarily be
     * recovered; the representation of the new `BigDecimal`
     * may have a different scale.  In particular, if this
     * `BigDecimal` has a negative scale, the string resulting
     * from this method will have a scale of zero when processed by
     * the string constructor.
     *
     * @return a string representation of this `BigDecimal`
     * without an exponent field.
     * @see {@link toString}
     * @see {@link toEngineeringString}
     */
    toPlainString(): string {
        if (this._scale === 0) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                return this.intCompact.toString();
            } else {
                return this.intVal!.toString();
            }
        }
        if (this._scale < 0) { // No decimal point
            if (this.signum() === 0) {
                return '0';
            }
            const trailingZeros = this.checkScale(-this._scale);
            let buf = '';
            if (this.intCompact !== BigDecimal.INFLATED) {
                buf += this.intCompact.toString();
            } else {
                buf += this.intVal!.toString();
            }
            for (let i = 0; i < trailingZeros; i++) {
                buf += '0';
            }
            return buf;
        }
        let str;
        if (this.intCompact !== BigDecimal.INFLATED) {
            str = Math.abs(this.intCompact).toString();
        } else {
            str = BigDecimal.bigIntAbs(this.intVal!).toString();
        }
        return BigDecimal.getValueString(this.signum(), str, this._scale);
    }

    /**
     * Returns a digit.digit string
     * @internal
     */
    private static getValueString(signum: number, intString: string, scale: number): string {
        /* Insert decimal point */
        let buf = '';
        const insertionPoint = intString.length - scale;
        if (insertionPoint === 0) { /* Point goes right before intVal */
            return (signum < 0 ? '-0.' : '0.') + intString;
        } else if (insertionPoint > 0) { /* Point goes inside intVal */
            buf = intString.slice(0, insertionPoint) + '.' + intString.slice(insertionPoint);
            if (signum < 0)
                buf = '-' + buf;
        } else { /* We must insert zeros between point and intVal */
            buf += signum < 0 ? '-0.' : '0.';
            for (let i = 0; i < -insertionPoint; i++) {
                buf += '0';
            }
            buf += intString;
        }
        return buf.toString();
    }

    /**
     * Converts this `BigDecimal` to a `BigInt`.
     * Any fractional part of this will be discarded.  Note that this
     * conversion can lose information about the precision of the
     * `BigDecimal` value.
     *
     * To have an exception thrown if the conversion is inexact (in
     * other words if a nonzero fractional part is discarded), use the
     * {@link toBigIntExact} method.
     *
     * @return this `BigDecimal` converted to a `BigInt`.
     */
    toBigInt(): BigInt {
        // force to an integer, quietly
        return this.setScale(0, RoundingMode.DOWN).inflated();
    }

    /**
     * Converts this `BigDecimal` to a `BigInt`,
     * checking for lost information.  An exception is thrown if this
     * `BigDecimal` has a nonzero fractional part.
     *
     * @return this `BigDecimal` converted to a `BigInt`.
     * @throws RangeError if `this` has a nonzero fractional part.
     */
    toBigIntExact(): BigInt {
        // round to an integer, with Exception if decimal part non-0
        return this.setScale(0, RoundingMode.UNNECESSARY).inflated();
    }

    /**
     * Divides `BigInt` value by number value and
     * do rounding based on the passed in roundingMode.
     * @internal
     */
    private static divideAndRound5(bdividend: BigInt, ldivisor: number, roundingMode: number): BigInt {
        const dividendSignum = BigDecimal.bigIntSignum(bdividend);
        const divisorNegative = ldivisor < 0;

        if (dividendSignum === -1) bdividend = bdividend.valueOf() * BigDecimal.minusOneBigInt;
        if (divisorNegative) ldivisor *= -1;

        let mq = bdividend.valueOf() / BigInt(ldivisor);
        let r: number;

        const bDividendNumber = Number(bdividend);

        if (Number.isSafeInteger(bDividendNumber)) {
            r = bDividendNumber % ldivisor;
        } else {
            r = Number(bdividend.valueOf() % BigInt(ldivisor));
        }

        // record remainder is zero or not
        const isRemainderZero = (r === 0);

        // quotient sign
        const qsign = divisorNegative ? (dividendSignum * -1) : dividendSignum;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement3(ldivisor, roundingMode, qsign, mq, r)) {
                mq += BigDecimal.oneBigInt;
            }
        }
        return mq * BigInt(qsign);
    }

    /**
     * Divides `BigInt` value by `BigInt` value and
     * do rounding based on the passed in roundingMode.
     * @internal
     */
    private static divideAndRound6(bdividend: BigInt, bdivisor: BigInt, roundingMode: number): BigInt {
        const bdividendSignum = BigDecimal.bigIntSignum(bdividend);
        const bdivisorSignum = BigDecimal.bigIntSignum(bdivisor);

        if (bdividend < BigDecimal.zeroBigInt) bdividend = bdividend.valueOf() * BigDecimal.minusOneBigInt;
        if (bdivisor < BigDecimal.zeroBigInt) bdivisor = bdivisor.valueOf() * BigDecimal.minusOneBigInt;

        let mq = bdividend.valueOf() / bdivisor.valueOf();
        const mr = bdividend.valueOf() % bdivisor.valueOf();
        const isRemainderZero = mr === BigDecimal.zeroBigInt; // record remainder is zero or not
        const qsign = (bdividendSignum !== bdivisorSignum) ? -1 : 1; // quotient sign
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement2(bdivisor, roundingMode, qsign, mq, mr)) {
                mq += BigDecimal.oneBigInt;
            }
        }
        return mq * BigInt(qsign);
    }

    /**
     * Returns a `BigDecimal` whose value is `(xs /
     * ys)`, with rounding according to the context settings.
     *
     * Fast path - used only when (xscale <= yscale && yscale < 15
     * && mc.presision<15) {
     * @internal
     */
    private static divideSmallFastPath(
        xs: number,
        xscale: number,
        ys: number,
        yscale: number,
        preferredScale: number,
        mc: MathContext
    ) {
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

        const xraise = yscale - xscale; // xraise >=0
        const scaledX = (xraise === 0) ? xs : BigDecimal.integerMultiplyPowerTen(xs, xraise); // can't overflow here!
        let quotient;

        const cmp = BigDecimal.integerCompareMagnitude(scaledX, ys);
        if (cmp > 0) { // satisfy constraint (b)
            yscale -= 1; // [that is, divisor *= 10]
            const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
            if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {

                const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
                const scaledXs = BigDecimal.integerMultiplyPowerTen(xs, raise);
                if (scaledXs === BigDecimal.INFLATED) {
                    quotient = null;
                    if ((mcp - 1) >= 0 && (mcp - 1) < BigDecimal.TEN_POWERS_TABLE.length) {
                        quotient = BigDecimal.divideAndRound4(
                            BigInt(BigDecimal.TEN_POWERS_TABLE[mcp - 1]) * BigInt(scaledX),
                            ys,
                            scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale));
                    }
                    if (quotient === null) {
                        const rb = BigDecimal.bigMultiplyPowerTen2(scaledX, mcp - 1);
                        quotient = BigDecimal.divideAndRound4(
                            rb, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                        );
                    }
                } else {
                    quotient = BigDecimal.divideAndRound2(
                        scaledXs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                }
            } else {
                const newScale = BigDecimal.checkScaleNonZero(xscale - mcp);

                if (newScale === yscale) {
                    quotient = BigDecimal.divideAndRound2(
                        xs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                    );
                } else {
                    const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
                    const scaledYs = BigDecimal.integerMultiplyPowerTen(ys, raise);
                    if (scaledYs === BigDecimal.INFLATED) {
                        const rb = BigDecimal.bigMultiplyPowerTen2(ys, raise);
                        quotient = BigDecimal.divideAndRound3(
                            BigInt(xs), rb, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                        );
                    } else {
                        quotient = BigDecimal.divideAndRound2(
                            xs, scaledYs, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                        );
                    }
                }
            }
        } else {
            // abs(scaledX) <= abs(ys)
            // result is "scaledX * 10^msp / ys"
            const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
            if (cmp === 0) {
                // abs(scaleX)== abs(ys) => result will be scaled 10^mcp + correct sign
                quotient = BigDecimal.roundedTenPower(
                    ((scaledX < 0) === (ys < 0)) ? 1 : -1, mcp, scl, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                // abs(scaledX) < abs(ys)
                const scaledXs = BigDecimal.integerMultiplyPowerTen(scaledX, mcp);
                if (scaledXs === BigDecimal.INFLATED) {
                    quotient = null;
                    if (mcp < BigDecimal.TEN_POWERS_TABLE.length) {
                        quotient = BigDecimal.divideAndRound4(
                            BigInt(BigDecimal.TEN_POWERS_TABLE[mcp]) * BigInt(scaledX),
                            ys,
                            scl,
                            roundingMode,
                            BigDecimal.checkScaleNonZero(preferredScale)
                        );
                    }
                    if (quotient === null) {
                        const rb = BigDecimal.bigMultiplyPowerTen2(scaledX, mcp);
                        quotient = BigDecimal.divideAndRound4(
                            rb,
                            ys,
                            scl,
                            roundingMode,
                            BigDecimal.checkScaleNonZero(preferredScale)
                        );
                    }
                } else {
                    quotient = BigDecimal.divideAndRound2(
                        scaledXs,
                        ys,
                        scl,
                        roundingMode,
                        BigDecimal.checkScaleNonZero(preferredScale)
                    );
                }
            }
        }
        // doRound, here, only affects 1000000000 case.
        return BigDecimal.doRound(quotient, mc);
    }

    /**
     * calculate divideAndRound for ldividend*10^raise / divisor
     * when abs(dividend)==abs(divisor);
     * @internal
     */
    private static roundedTenPower(qsign: number, raise: number, scale: number, preferredScale: number): BigDecimal {
        if (scale > preferredScale) {
            const diff = scale - preferredScale;
            if (diff < raise) {
                return BigDecimal.scaledTenPow(raise - diff, qsign, preferredScale);
            } else {
                return BigDecimal.fromInteger3(qsign, scale - raise);
            }
        } else {
            return BigDecimal.scaledTenPow(raise, qsign, scale);
        }
    }

    /** @internal */
    private static scaledTenPow(n: number, sign: number, scale: number): BigDecimal {
        if (n < BigDecimal.TEN_POWERS_TABLE.length)
            return BigDecimal.fromInteger3(sign * BigDecimal.TEN_POWERS_TABLE[n], scale);
        else {
            let unscaledVal = BigInt(10) ** BigInt(n);
            if (sign === -1) {
                unscaledVal = unscaledVal * BigDecimal.minusOneBigInt;
            }
            return new BigDecimal(unscaledVal, BigDecimal.INFLATED, scale, n + 1);
        }
    }

    /**
     * Compare Normalize dividend & divisor so that both fall into [0.1, 0.999...]
     * @internal
     */
    private static compareMagnitudeNormalized(xs: number, xscale: number, ys: number, yscale: number): number {
        const sdiff = xscale - yscale;
        if (sdiff !== 0) {
            if (sdiff < 0) {
                xs = BigDecimal.integerMultiplyPowerTen(xs, -sdiff);
            } else {
                ys = BigDecimal.integerMultiplyPowerTen(ys, sdiff);
            }
        }
        if (xs !== BigDecimal.INFLATED)
            return (ys !== BigDecimal.INFLATED) ? BigDecimal.integerCompareMagnitude(xs, ys) : -1;
        else
            return 1;
    }

    /**
     * Compare Normalize dividend & divisor so that both fall into [0.1, 0.999...]
     * @internal
     */
    private static compareMagnitudeNormalized2(xs: number, xscale: number, ys: BigInt, yscale: number): number {
        if (xs === 0)
            return -1;
        const sdiff = xscale - yscale;
        if (sdiff < 0) {
            if (BigDecimal.integerMultiplyPowerTen(xs, -sdiff) === BigDecimal.INFLATED) {
                return BigDecimal.bigIntCompareMagnitude(BigDecimal.bigMultiplyPowerTen2(xs, -sdiff), ys);
            }
        }
        return -1;
    }

    /**
     * Compare Normalize dividend & divisor so that both fall into [0.1, 0.999...]
     * @internal
     */
    private static compareMagnitudeNormalized3(xs: BigInt, xscale: number, ys: BigInt, yscale: number): number {
        const sdiff = xscale - yscale;
        if (sdiff < 0) {
            return BigDecimal.bigIntCompareMagnitude(BigDecimal.bigMultiplyPowerTen3(xs, -sdiff), ys);
        } else { // sdiff >= 0
            return BigDecimal.bigIntCompareMagnitude(xs, BigDecimal.bigMultiplyPowerTen3(ys, sdiff));
        }
    }

    /** @internal */
    private static divide7(
        dividend: number, dividendScale: number, divisor: number, divisorScale: number, scale: number, roundingMode: RoundingMode
    ): BigDecimal {
        if (BigDecimal.checkScale2(dividend, scale + divisorScale) > dividendScale) {
            const newScale = scale + divisorScale;
            const raise = newScale - dividendScale;
            if (raise < BigDecimal.TEN_POWERS_TABLE.length) {
                let xs = dividend;
                if ((xs = BigDecimal.integerMultiplyPowerTen(xs, raise)) !== BigDecimal.INFLATED) {
                    return BigDecimal.divideAndRound2(xs, divisor, scale, roundingMode, scale);
                }
            }
            const scaledDividend = BigDecimal.bigMultiplyPowerTen2(dividend, raise);
            return BigDecimal.divideAndRound4(scaledDividend, divisor, scale, roundingMode, scale);
        } else {
            const newScale = BigDecimal.checkScale2(divisor, dividendScale - scale);
            const raise = newScale - divisorScale;
            if (raise < BigDecimal.TEN_POWERS_TABLE.length) {
                let ys = divisor;
                if ((ys = BigDecimal.integerMultiplyPowerTen(ys, raise)) !== BigDecimal.INFLATED) {
                    return BigDecimal.divideAndRound2(dividend, ys, scale, roundingMode, scale);
                }
            }
            const scaledDivisor = BigDecimal.bigMultiplyPowerTen2(divisor, raise);
            return BigDecimal.divideAndRound3(BigInt(dividend), scaledDivisor, scale, roundingMode, scale);
        }
    }

    /** @internal */
    private static divide8(
        dividend: number, dividendScale: number, divisor: BigInt, divisorScale: number, scale: number, roundingMode: RoundingMode
    ): BigDecimal {
        if (BigDecimal.checkScale2(dividend, scale + divisorScale) > dividendScale) {
            const newScale = scale + divisorScale;
            const raise = newScale - dividendScale;
            const scaledDividend = BigDecimal.bigMultiplyPowerTen2(dividend, raise);
            return BigDecimal.divideAndRound3(scaledDividend, divisor, scale, roundingMode, scale);
        } else {
            const newScale = BigDecimal.checkScale3(divisor, dividendScale - scale);
            const raise = newScale - divisorScale;
            const scaledDivisor = BigDecimal.bigMultiplyPowerTen3(divisor, raise);
            return BigDecimal.divideAndRound3(BigInt(dividend), scaledDivisor, scale, roundingMode, scale);
        }
    }

    /** @internal */
    private static divide9(
        dividend: BigInt, dividendScale: number, divisor: number, divisorScale: number, scale: number, roundingMode: RoundingMode
    ): BigDecimal {
        if (BigDecimal.checkScale3(dividend, scale + divisorScale) > dividendScale) {
            const newScale = scale + divisorScale;
            const raise = newScale - dividendScale;
            const scaledDividend = BigDecimal.bigMultiplyPowerTen3(dividend, raise);
            return BigDecimal.divideAndRound4(scaledDividend, divisor, scale, roundingMode, scale);
        } else {
            const newScale = BigDecimal.checkScale2(divisor, dividendScale - scale);
            const raise = newScale - divisorScale;
            if (raise < BigDecimal.TEN_POWERS_TABLE.length) {
                let ys = divisor;
                if ((ys = BigDecimal.integerMultiplyPowerTen(ys, raise)) !== BigDecimal.INFLATED) {
                    return BigDecimal.divideAndRound4(dividend, ys, scale, roundingMode, scale);
                }
            }
            const scaledDivisor = BigDecimal.bigMultiplyPowerTen2(divisor, raise);
            return BigDecimal.divideAndRound3(dividend, scaledDivisor, scale, roundingMode, scale);
        }
    }

    /** @internal */
    private static divide10(
        dividend: BigInt, dividendScale: number, divisor: BigInt, divisorScale: number, scale: number, roundingMode: RoundingMode
    ): BigDecimal {
        if (BigDecimal.checkScale3(dividend, scale + divisorScale) > dividendScale) {
            const newScale = scale + divisorScale;
            const raise = newScale - dividendScale;
            const scaledDividend = BigDecimal.bigMultiplyPowerTen3(dividend, raise);
            return BigDecimal.divideAndRound3(scaledDividend, divisor, scale, roundingMode, scale);
        } else {
            const newScale = BigDecimal.checkScale3(divisor, dividendScale - scale);
            const raise = newScale - divisorScale;
            const scaledDivisor = BigDecimal.bigMultiplyPowerTen3(divisor, raise);
            return BigDecimal.divideAndRound3(dividend, scaledDivisor, scale, roundingMode, scale);
        }
    }
}

interface BigDecimalConstructor {
    (n: any, scale?: number, mc?: MathContext): BigDecimal;

    new(n: any, scale?: number, mc?: MathContext): BigDecimal;
}

/**
 * Constructor function for {@link BigDecimal}. Can be invoked with new or without new.
 *
 * The values passed must match one of Java BigDecimal's constructors, so the valid usages of this function is listed below:
 * ```javascript
 * Big(123n); // bigint, 123
 * Big(123n, 3); // bigint and scale, 0.123
 * Big(123n, 3, MC(2, RoundingMode.HALF_UP)); // bigint, scale and mc, 0.12
 * Big(123n, undefined, MC(2, RoundingMode.HALF_UP)); // bigint and mc, 1.2E+2
 * Big('1.13e12'); // string, 1.13E+12
 * Big('1.11e11', undefined, MC(2, RoundingMode.HALF_UP)); // string and mc, 1.1E+11
 * Big(10000); // number, 10000
 * Big(123, 5); // integer and scale, 0.00123
 * Big(1.1233, undefined, MC(2, RoundingMode.HALF_UP)); // number and scale, 1.1
 * ```
 *
 * Sample Usage:
 *```javascript
 * // Single unified constructor for multiple values
 * const { Big } = require('bigdecimal.js');
 *
 * // Construct from a string and clone it
 * const x = Big('1.1111111111111111111111');
 * const y = new Big(x); // you can also use 'new'
 *
 * const z = x.add(y);
 * console.log(z.toString()); // 2.2222222222222222222222
 *
 * // You can also construct from a number or BigInt:
 * const u = Big(1.1);
 * const v = Big(2n);
 *
 * console.log(u.toString()); // 1.1
 * console.log(v.toString()); // 2
 * ```
 *
 * @param n Any value to build a BigDecimal from. Types other than `Number`, `BigInt` and `BigDecimal` will be internally
 * converted to string and parsed.
 * @param scale Scale to use, by default 0.
 * @param mc MathContext object which allows you to set precision and rounding mode.
 * @throws RangeError on following situations:
 * * If value is a number:
 *     * Value is not in the range `[-Number.MAX_VALUE, Number.MAX_VALUE]`
 *     * Both a scale and a math context is provided. You can only give one of scale and math context.
 *       Passing `undefined` is same as omitting an argument.
 *     * If value is a double and scale is given.
 * * If value is not a `number`, a `BigInt` or a `BigDecimal`, it will be converted to string.
 *   An error will be thrown if the string format is invalid.
 * * If value is not a `BigInt` or `number`, and scale is given.
 */
export const Big = <BigDecimalConstructor> function _Big(n: any, scale?: number, mc?: MathContext): BigDecimal {
    return BigDecimal.fromValue(n, scale, mc);
};

interface MathContextConstructor {
    (precision: number, roundingMode?: RoundingMode): MathContext;

    new(precision: number, roundingMode?: RoundingMode): MathContext;
}

/**
 * Constructor function for {@link MathContext}. Can be invoked with new or without new.
 *
 * Sample Usage:
 * ```javascript
 * const { Big, MC, RoundingMode } = require('bigdecimal.js');
 *
 * const x = Big('1');
 * const y = Big('3');
 *
 * const res1 = x.divideWithMathContext(y, new MC(3));
 * console.log(res1.toString()); // 0.333
 *
 * // You can also use without `new` operator
 * const res2 = x.divideWithMathContext(y, MC(3, RoundingMode.UP));
 * console.log(res2.toString()); // 0.334
 *
 * try {
 *     x.divide(y);
 *     // throws since full precision is requested but it is not possible
 * } catch (e) {
 *     console.log(e); // RangeError: Non-terminating decimal expansion; no exact representable decimal result.
 * }
 * ```
 *
 * @param precision Precision value
 * @param roundingMode Optional rounding Mode. By default RoundingMode.HALF_UP.
 */
export const MC = <MathContextConstructor> function _MC(precision: number, roundingMode?: RoundingMode): MathContext {
    return new MathContext(precision, roundingMode);
};
