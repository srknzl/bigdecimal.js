/*
  Copyright (c) 2021 Serkan Özel. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
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
 * import { Big, MathContext, RoundingMode } from './index';
 *
 * const x = Big('1');
 * const y = Big('3');
 *
 * const res1 = x.divide(y, new MathContext(3));
 * console.log(res1.toString()); // 0.333
 *
 * const res2 = x.divide(y, new MathContext(3, RoundingMode.UP));
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
     * The rounding algorithm to be used for an operation.
     *
     * see {@link RoundingMode}
     */
    readonly roundingMode: RoundingMode;

    constructor(setPrecision: number, setRoundingMode: RoundingMode = MathContext.DEFAULT_ROUNDINGMODE) {
        if (setPrecision < 0) {
            throw new RangeError('Digits < 0');
        } else if (setRoundingMode === null) {
            throw new TypeError('RoundingMode is null');
        } else {
            this.precision = setPrecision;
            this.roundingMode = setRoundingMode;
        }
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
 * BigInt based BigDecimal implementation. This class is ported from java.math.BigDecimal. The following documentation is from
 * openjdk/jdk repository.
 *
 * Immutable, arbitrary-precision signed decimal numbers.  A
 * `BigDecimal` consists of an arbitrary precision integer
 * {@link unscaledValue | unscaled value} and a 32-bit
 * integer {@link scale | scale}.  If zero or positive,
 * the scale is the number of digits to the right of the decimal
 * point.  If negative, the unscaled value of the number is multiplied
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
 * `19/100 = 0.19   // integer=19,  scale=2` <br>
 *
 * but<br>
 *
 * `21/110 = 0.190  // integer=190, scale=3` <br>
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
 * As a 32-bit integer, the set of values for the scale is large,
 * but bounded. If the scale of a result would exceed the range of a
 * 32-bit integer, either by overflow or underflow, the operation may
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
 * differences as well. The fundamental similarity shared by {@code
 * BigDecimal} and IEEE 754 decimal arithmetic is the conceptual
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
    readonly intVal: BigInt | null;

    /** @internal */
    readonly _scale: number;

    /** @internal */
    precision: number;

    /** @internal */
    stringCache: string | undefined = undefined;

    /** @internal */
    readonly intCompact: number;

    /**
     * Sentinel value for {@link intCompact} indicating the
     * significand information is only available from intVal.
     * @internal
     */
    private static readonly INFLATED = Number.MIN_SAFE_INTEGER;
    /** @internal */
    private static readonly INFLATED_BIGINT = BigInt(BigDecimal.INFLATED);

    private static readonly MAX_INT_VALUE = 2e32 - 1;
    private static readonly MIN_INT_VALUE = -1 * (2e32 - 1);

    /** @internal */
    private static readonly MAX_COMPACT_DIGITS = 15;

    /** @internal */
    private static readonly ZERO_THROUGH_TEN = [
        new BigDecimal(BigInt(0), 0, 0, 1),
        new BigDecimal(BigInt(1), 1, 0, 1),
        new BigDecimal(BigInt(2), 2, 0, 1),
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
    private static readonly TEN = BigDecimal.ZERO_THROUGH_TEN[10];

    /** @internal */
    private static readonly ZERO_SCALED_BY = [
        BigDecimal.ZERO_THROUGH_TEN[0],
        new BigDecimal(BigInt(0), 0, 1, 1),
        new BigDecimal(BigInt(0), 0, 2, 1),
        new BigDecimal(BigInt(0), 0, 3, 1),
        new BigDecimal(BigInt(0), 0, 4, 1),
        new BigDecimal(BigInt(0), 0, 5, 1),
        new BigDecimal(BigInt(0), 0, 6, 1),
        new BigDecimal(BigInt(0), 0, 7, 1),
        new BigDecimal(BigInt(0), 0, 8, 1),
        new BigDecimal(BigInt(0), 0, 9, 1),
        new BigDecimal(BigInt(0), 0, 10, 1),
        new BigDecimal(BigInt(0), 0, 11, 1),
        new BigDecimal(BigInt(0), 0, 12, 1),
        new BigDecimal(BigInt(0), 0, 13, 1),
        new BigDecimal(BigInt(0), 0, 14, 1),
        new BigDecimal(BigInt(0), 0, 15, 1),
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
    private static readonly ONE_TENTH = BigDecimal.fromNumber3(1, 1);
    /** @internal */
    private static readonly ONE_HALF = BigDecimal.fromNumber3(5, 1);
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
        if (adjustedScale > Number.MAX_SAFE_INTEGER || adjustedScale < Number.MIN_SAFE_INTEGER)
            throw new RangeError('Scale out of range.');
        scl = adjustedScale;
        return scl;
    }

    /** @internal */
    private constructor(bigIntValue: BigInt | null, intCompact: number, scale: number, precision: number) {
        this.intVal = bigIntValue;
        this._scale = scale;
        this.precision = precision;
        this.intCompact = intCompact;
    }

    /** @internal */
    private static checkFromIndexSize(fromIndex: number, size: number, length: number) {
        if (!((length | fromIndex | size) >= 0 && size <= length - fromIndex)) throw new RangeError('Out of bounds');
    }

    /** @internal */
    private static from1(input: string, offset: number, len: number, mc: MathContext = MathContext.UNLIMITED): BigDecimal {
        let prec = 0;
        let scl = 0;
        let rs = 0;
        let rb: BigInt | null = null;

        let isneg = false;
        if (input[offset] === '-') {
            isneg = true;
            offset++;
            len--;
        } else if (input[offset] === '+') {
            offset++;
            len--;
        }

        let dot = false;
        let exp = 0;
        let c: string;
        const isCompact = len <= this.MAX_COMPACT_DIGITS;

        let idx = 0;
        if (isCompact) {
            for (; len > 0; offset++, len--) {
                c = input[offset];
                if ((c === '0')) {
                    if (prec === 0)
                        prec = 1;
                    else if (rs !== 0) {
                        rs *= 10;
                        ++prec;
                    }
                    if (dot)
                        ++scl;
                } else if ((c >= '1' && c <= '9')) {
                    const digit = +c;
                    if (prec !== 1 || rs !== 0)
                        ++prec;
                    rs = rs * 10 + digit;
                    if (dot)
                        ++scl;
                } else if (c === '.') {
                    if (dot)
                        throw new RangeError('Character array contains more than one decimal point.');
                    dot = true;
                } else if ((c === 'e') || (c === 'E')) {
                    exp = BigDecimal.parseExp(input, offset, len);

                    if (exp > Number.MAX_SAFE_INTEGER)
                        throw new RangeError('Exponent overflow.');
                    break;
                } else {
                    throw new RangeError('Character ' + c
                        + ' is neither a decimal digit number, decimal point, nor'
                        + ' "e" notation exponential mark.');
                }
            }
            if (prec === 0)
                throw new RangeError('No digits found.');

            if (exp !== 0) {
                scl = BigDecimal.adjustScale(scl, exp);
            }
            rs = isneg ? -rs : rs;
            const mcp = mc.precision;
            let drop = prec - mcp;
            if (mcp > 0 && drop > 0) {
                while (drop > 0) {
                    scl = BigDecimal.checkScaleNonZero(scl - drop);
                    rs = BigDecimal.divideAndRound(rs, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.numberDigitLength(rs);
                    drop = prec - mcp;
                }
            }
        } else {
            const coeff = [];
            for (; len > 0; offset++, len--) {
                c = input[offset];
                if (c >= '0' && c <= '9') {
                    if (c === '0') {
                        if (prec === 0) {
                            coeff[idx] = c;
                            prec = 1;
                        } else if (idx !== 0) {
                            coeff[idx++] = c;
                            prec++;
                        }
                    } else {
                        if (prec !== 1 || idx !== 0) prec++;
                        coeff[idx++] = c;
                    }
                    if (dot) scl++;
                    continue;
                }
                if (c === '.') {
                    if (dot) {
                        throw new RangeError('String contains more than one decimal point.');
                    }
                    dot = true;
                    continue;
                }
                if ((c !== 'e') && (c !== 'E')) {
                    throw new RangeError('String is missing "e" notation exponential mark.');
                }
                exp = BigDecimal.parseExp(input, offset, len);
                break;
            }
            if (prec === 0) {
                throw new RangeError('No digits found.');
            }
            if (exp !== 0) {
                scl = BigDecimal.adjustScale(scl, exp);
            }
            const stringValue = coeff.join('');
            if (isneg) rb = BigInt('-' + stringValue);
            else rb = BigInt(stringValue);
            rs = BigDecimal.compactValFor(rb);
            const mcp = mc.precision;
            if (mcp > 0 && (prec > mcp)) {
                if (rs === BigDecimal.INFLATED) {
                    let drop = prec - mcp;
                    while (drop < 0) {
                        scl = BigDecimal.checkScaleNonZero(scl - drop);
                        rb = BigDecimal.divideAndRoundByTenPow(rb, drop, mc.roundingMode);
                        rs = BigDecimal.compactValFor(rb);
                        if (rs !== BigDecimal.INFLATED) {
                            prec = BigDecimal.numberDigitLength(rs);
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
                        prec = BigDecimal.numberDigitLength(rs);
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

    /** @internal */
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
                prec = BigDecimal.numberDigitLength(compactVal);
                let drop = prec - mcp; // drop can't be more than 15
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mode);
                    prec = BigDecimal.numberDigitLength(compactVal);
                    drop = prec - mcp;
                }
                unscaledVal = null;
            }
        }
        return new BigDecimal(unscaledVal, compactVal, scale, prec);
    }

    /** @internal */
    private static fromBigInt3(intVal: BigInt): BigDecimal {
        const intCompact = BigDecimal.compactValFor(intVal);
        return new BigDecimal(intVal, intCompact, 0, 0);
    }

    /** @internal */
    private static fromBigInt4(intVal: BigInt, scale: number): BigDecimal {
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

    /** @internal */
    private static fromDouble(double: number): BigDecimal {
        const strValue = String(double);
        return BigDecimal.from1(strValue, 0, strValue.length);
    }

    /**
     * Construct a new BigDecimal from a number with given scale and precision
     * @param value
     * @param scale
     * @param mc
     * @throws RangeError If:
     * * Value is not a number
     * * Value is not in the range [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
     * * A scale is not provided but a precision is provided
     */
    /** @internal */
    private static fromNumber(value: number, scale?: number, mc?: MathContext): BigDecimal {
        if (!(value > Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)) {
            throw new RangeError('Value must be a safe number');
        }

        if (!Number.isInteger(value)) {
            return BigDecimal.fromDouble(value);
        }

        if (mc !== undefined) {
            if (scale !== undefined) {
                return BigDecimal.fromNumber2(value, scale, mc.precision);
            } else {
                return BigDecimal.fromNumber5(value, mc);
            }
        } else {
            if (scale !== undefined) {
                return BigDecimal.fromNumber3(value, scale);
            } else {
                return BigDecimal.fromNumber4(value);
            }
        }
    }

    /** @internal */
    private static fromNumber2(value: number, scale: number, prec: number): BigDecimal {
        if (scale === 0 && value >= 0 && value < BigDecimal.ZERO_THROUGH_TEN.length) {
            return BigDecimal.ZERO_THROUGH_TEN[value];
        } else if (value === 0) {
            return BigDecimal.zeroValueOf(scale);
        }

        return new BigDecimal(value === BigDecimal.INFLATED ? BigDecimal.INFLATED_BIGINT : null, value, scale, prec);
    }

    /** @internal */
    private static fromNumber3(value: number, scale: number): BigDecimal {
        if (scale === 0) {
            return BigDecimal.fromNumber4(value);
        } else if (value === 0) {
            return BigDecimal.zeroValueOf(scale);
        }

        // if (!Number.isSafeInteger(value)) {
        //     value = BigDecimal.INFLATED;
        // }

        return new BigDecimal(value === BigDecimal.INFLATED ? BigDecimal.INFLATED_BIGINT : null, value, scale, 0);
    }

    /** @internal */
    private static fromNumber4(value: number): BigDecimal {
        if (value >= 0 && value <= this.ZERO_THROUGH_TEN.length) {
            return this.ZERO_THROUGH_TEN[value];
        } else if (value !== BigDecimal.INFLATED) {
            return new BigDecimal(null, value, 0, 0);
        } else {
            return new BigDecimal(this.INFLATED_BIGINT, value, 0, 0);
        }
    }

    /** @internal */
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
                prec = BigDecimal.numberDigitLength(value);
                let drop = prec - mcp;
                while (drop > 0) {
                    scl = BigDecimal.checkScaleNonZero(scl - drop);
                    value = BigDecimal.divideAndRound(value, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.numberDigitLength(value);
                    drop = prec - mcp;
                }
                rb = null;
            }
        }
        return new BigDecimal(rb, value, scl, prec);
    }

    /** @internal */
    private static numberDigitLength(value: number): number {
        if (value < 0) value *= -1;
        return Math.ceil(Math.log10(value + 1));
    }

    /** @internal */
    private static parseExp(input: string, offset: number, len: number): number {
        let exp = 0;
        offset++;
        let c = input[offset];
        len--;
        const negexp = (c === '-');
        if (negexp || c === '+') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len <= 0) {
            throw new RangeError('No exponent digits');
        }
        while (len > 10 && c === '0') {
            offset++;
            c = input[offset];
            len--;
        }
        if (len > 10) {
            throw new RangeError('Too many nonzero exponent digits');
        }
        for (; ; len--) {
            let v: number;
            if (c >= '0' && c <= '9') {
                v = +c;
            } else {
                throw new RangeError('Not a digit.');
            }
            exp = exp * 10 + v;
            if (len === 1)
                break;
            offset++;
            c = input[offset];
        }
        if (negexp)
            exp = -exp;
        return exp;
    }

    /** @internal */
    static fromValue(n: any, scale?: number, mc?: MathContext): BigDecimal {
        if (typeof n === 'number') {
            return BigDecimal.fromNumber(n, scale, mc);
        }
        if (typeof n === 'bigint') {
            return BigDecimal.fromBigInt(n, scale, mc);
        }
        if (n instanceof BigDecimal) {
            return new BigDecimal(n.intVal, n.intCompact, n.scale(), n.precision);
        }
        n = String(n);
        return BigDecimal.from1(n, 0, n.length, mc);
    }

    /** @internal */
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
        const sameSignum = ((fst! === 0n && snd! === 0n) || (fst! > 0n && snd! > 0n) || (fst! < 0n && snd! < 0n));
        return sameSignum ? new BigDecimal(sum, BigDecimal.INFLATED, rscale, 0) : BigDecimal.fromBigInt5(sum, rscale, 0);
    }

    /** @internal */
    private static add2(xs: number, scale1: number, snd: BigInt, scale2: number) {
        let rscale = scale1;
        const sdiff = rscale - scale2;
        const sameSigns = ((snd! === 0n && xs === 0) || (snd! > 0n && xs > 0) || (snd! < 0n && xs < 0));
        let sum;
        if (sdiff < 0) {
            const raise = this.checkScale2(xs, -sdiff);
            rscale = scale2;
            const scaledX = BigDecimal.numberMultiplyPowerTen(xs, raise);
            if (scaledX === BigDecimal.INFLATED) {
                sum = snd!.valueOf() + BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf();
            } else {
                sum = snd!.valueOf() + BigInt(scaledX).valueOf();
            }
        } else {
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
            const scaledX = BigDecimal.numberMultiplyPowerTen(xs, raise);
            if (scaledX !== BigDecimal.INFLATED) {
                return BigDecimal.add4(scaledX, ys, scale2);
            } else {
                const bigsum = BigDecimal.bigMultiplyPowerTen2(xs, raise).valueOf() + BigInt(ys).valueOf();
                return ((xs ^ ys) >= 0) ?
                    new BigDecimal(bigsum, BigDecimal.INFLATED, scale2, 0) : BigDecimal.fromBigInt5(bigsum, scale2, 0);
            }
        } else {
            const raise = this.checkScale2(ys, sdiff);
            const scaledY = BigDecimal.numberMultiplyPowerTen(ys, raise);
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
            return BigDecimal.fromNumber3(sum, scale);
        return BigDecimal.fromBigInt5(BigInt(xs) + BigInt(ys), scale, 0);
    }

    /** @internal */
    private static add5(xs: number, ys: number): number {
        const sum = xs + ys;
        if (sum >= Number.MAX_SAFE_INTEGER)
            return BigDecimal.INFLATED;
        return sum;
    }

    /** @internal */
    private static numberMultiplyPowerTen(val: number, n: number): number {
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

    signum(): number {
        const intCompactSignum = this.intCompact > 0 ? 1 : (this.intCompact < 0 ? -1 : 0);
        const intValSignum = BigDecimal.bigIntSignum(this.intVal!);
        return this.intCompact !== BigDecimal.INFLATED ? intCompactSignum : intValSignum;
    }

    /** @internal */
    private inflated(): BigInt {
        return this.intVal === null ? BigInt(this.intCompact) : this.intVal;
    }

    /** @internal */
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
            if (intVal !== 0n) {
                throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
            }
        }
        return val;
    }

    /** @internal */
    private static checkScaleNonZero(val: number) {
        if (val > BigDecimal.MAX_INT_VALUE || val < BigDecimal.MIN_INT_VALUE) {
            throw new RangeError(val > 0 ? 'Scale too high' : 'Scale too less');
        }
        return val;
    }

    /** @internal */
    private static divideAndRoundByTenPow(intVal: BigInt, tenPow: number, roundingMode: number): BigInt {
        if (tenPow < BigDecimal.TEN_POWERS_TABLE.length)
            intVal = BigDecimal.divideAndRound5(intVal, BigDecimal.TEN_POWERS_TABLE[tenPow], roundingMode);
        else
            intVal = BigDecimal.divideAndRound6(intVal, BigInt(10) ** BigInt(tenPow), roundingMode);
        return intVal;
    }

    /** @internal */
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

    /** @internal */
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
            return new BigDecimal(BigInt(0), 0, scale, 1);
    }

    /** @internal */
    private getPrecision(): number {
        let result = this.precision;
        if (result === 0) {
            const s = this.intCompact;
            if (s !== BigDecimal.INFLATED)
                result = BigDecimal.numberDigitLength(s);
            else
                result = BigDecimal.bigDigitLength(this.intVal!);
            this.precision = result;
        }
        return result;
    }

    /** @internal */
    private static doRound(val: BigDecimal, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        let wasDivided = false;
        if (mcp > 0) {
            let intVal = val.intVal;
            let compactVal = val.intCompact;
            let scale = val._scale;
            let prec = val.getPrecision();
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
                        prec = BigDecimal.numberDigitLength(compactVal);
                        break;
                    }
                    prec = BigDecimal.bigDigitLength(intVal!);
                    drop = prec - mcp;
                }
            }
            if (compactVal !== BigDecimal.INFLATED) {
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    wasDivided = true;
                    prec = BigDecimal.numberDigitLength(compactVal);
                    drop = prec - mcp;
                    intVal = null;
                }
            }
            return wasDivided ? new BigDecimal(intVal, compactVal, scale, prec) : val;
        }
        return val;
    }

    /** @internal */
    private static bigDigitLength(b: BigInt) {
        if (b < 0n) b = b.valueOf() * -1n;
        return b.toString().length;
    }

    /** @internal */
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
                prec = BigDecimal.numberDigitLength(compactVal);
                drop = prec - mcp;
                while (drop > 0) {
                    scale = BigDecimal.checkScaleNonZero(scale - drop);
                    compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                    prec = BigDecimal.numberDigitLength(compactVal);
                    drop = prec - mcp;
                }
                return BigDecimal.fromNumber2(compactVal, scale, prec);
            }
        }
        return new BigDecimal(intVal, BigDecimal.INFLATED, scale, prec);
    }

    /** @internal */
    private static doRound3(compactVal: number, scale: number, mc: MathContext): BigDecimal {
        const mcp = mc.precision;
        if (mcp > 0 && mcp < 19) {
            let prec = BigDecimal.numberDigitLength(compactVal);
            let drop = prec - mcp;
            while (drop > 0) {
                scale = BigDecimal.checkScaleNonZero(scale - drop);
                compactVal = BigDecimal.divideAndRound(compactVal, BigDecimal.TEN_POWERS_TABLE[drop], mc.roundingMode);
                prec = BigDecimal.numberDigitLength(compactVal);
                drop = prec - mcp;
            }
            return BigDecimal.fromNumber2(compactVal, scale, prec);
        }
        return BigDecimal.fromNumber3(compactVal, scale);
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

    /** @internal */
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
        return BigDecimal.fromNumber3(compactVal, scale);
    }

    /** @internal */
    private static createAndStripZerosToMatchScale2(intVal: BigInt, scale: number, preferredScale: number): BigDecimal {
        let qr: BigInt[];
        while (BigDecimal.bigIntCompareMagnitude(intVal!, 10n) >= 0 && scale > preferredScale) {
            if (intVal!.valueOf() % 2n === 1n)
                break;
            qr = [intVal!.valueOf() / 10n, intVal!.valueOf() % 10n];
            if (BigDecimal.bigIntSignum(qr[1]) !== 0)
                break;
            intVal = qr[0];
            scale = this.checkScale3(intVal, scale - 1);
        }
        return BigDecimal.fromBigInt5(intVal!, scale, 0);
    }

    /** @internal */
    private static matchScale(val: BigDecimal[]): void {
        if (val[0]._scale < val[1]._scale) {
            val[0] = val[0].setScale(val[1]._scale, RoundingMode.UNNECESSARY);
        } else if (val[1]._scale < val[0]._scale) {
            val[1] = val[1].setScale(val[0]._scale, RoundingMode.UNNECESSARY);
        }
    }

    /** @internal */
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

        const estResultUlpScale = big._scale - big.getPrecision() + mc.precision;

        const smallHighDigitPos = small._scale - small.getPrecision() + 1;
        if (smallHighDigitPos > big._scale + 2 &&
            smallHighDigitPos > estResultUlpScale + 2) {
            small = BigDecimal.fromNumber3(small.signum(), this.checkScale(Math.max(big._scale, estResultUlpScale) + 3));
        }
        return [big, small];
    }

    negate(mc?: MathContext): BigDecimal {
        let result = this.intCompact === BigDecimal.INFLATED ?
            new BigDecimal(-1n * this.intVal!.valueOf(), BigDecimal.INFLATED, this._scale, this.precision) :
            BigDecimal.fromNumber2(-this.intCompact, this._scale, this.precision);
        if (mc) {
            result = result.plus(mc);
        }
        return result;
    }

    add(augend: BigDecimal, mc?: MathContext): BigDecimal {
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
            } else {
                const precisionDiff = mc.precision - result.getPrecision();
                const scaleDiff = preferredScale - result._scale;

                if (precisionDiff >= scaleDiff)
                    return result.setScale(preferredScale);
                else
                    return result.setScale(result._scale + precisionDiff);
            }
        }
        const padding = lhs._scale - augend._scale;
        if (padding !== 0) {
            const arg = this.preAlign(augend, padding, mc);
            BigDecimal.matchScale(arg);
            lhs = arg[0];
            augend = arg[1];
        }
        return BigDecimal.doRound2(lhs.inflated().valueOf() + augend.inflated().valueOf(), lhs._scale, mc);
    }

    subtract(subtrahend: BigDecimal, mc?: MathContext): BigDecimal {
        subtrahend = BigDecimal.convertToBigDecimal(subtrahend);
        if (!mc || (mc && mc.precision === 0)) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                if ((subtrahend.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.add3(this.intCompact, this._scale, -subtrahend.intCompact, subtrahend._scale);
                } else {
                    return BigDecimal.add2(this.intCompact, this._scale, -1n * subtrahend.intVal!.valueOf(), subtrahend._scale);
                }
            } else {
                if ((subtrahend.intCompact !== BigDecimal.INFLATED)) {
                    return BigDecimal.add2(-subtrahend.intCompact, subtrahend._scale, this.intVal!, this._scale);
                } else {
                    return BigDecimal.add1(this.intVal!, this._scale, -1n * subtrahend.intVal!.valueOf(), subtrahend._scale);
                }
            }
        }
        return this.add(subtrahend.negate(), mc);
    }

    multiply(multiplicand: BigDecimal, mc?: MathContext): BigDecimal {
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

    divide(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (!mc || (mc && mc.precision === 0)) {
            if (divisor.signum() === 0) {
                if (this.signum() === 0)
                    throw new RangeError('Division undefined');
                throw new RangeError('Division by zero');
            }

            const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);

            if (this.signum() === 0)
                return BigDecimal.zeroValueOf(preferredScale);
            else {
                const mc = new MathContext(
                    Math.min(this.getPrecision() + Math.ceil(10.0 * divisor.getPrecision() / 3.0), Number.MAX_SAFE_INTEGER),
                    RoundingMode.UNNECESSARY
                );
                let quotient: BigDecimal;
                try {
                    quotient = this.divide(divisor, mc);
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
        if (divisor.signum() === 0) {
            if (this.signum() === 0)
                throw new RangeError('Division undefined');
            throw new RangeError('Division by zero');
        }
        if (this.signum() === 0)
            return BigDecimal.zeroValueOf(BigDecimal.saturateScale(preferredScale));
        const xscale = this.getPrecision();
        const yscale = divisor.getPrecision();
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
            return BigDecimal.fromNumber3(product, scale);
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

    /** @internal */
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
    private static saturateScale(s: number) {
        if (s > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (s < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return s;
    }

    /** @internal */
    private static divide2(
        xs: number, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        const mcp = mc.precision;
        if (xscale <= yscale && yscale < 15 && mcp < 15) {
            return BigDecimal.divideSmallFastPath(xs, xscale, ys, yscale, preferredScale, mc);
        }
        if (BigDecimal.compareMagnitudeNormalized(xs, xscale, ys, yscale) > 0) {
            yscale -= 1;
        }
        const roundingMode = mc.roundingMode;
        const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
        let quotient: BigDecimal;
        if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {
            const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
            let scaledXs;
            if ((scaledXs = BigDecimal.numberMultiplyPowerTen(xs, raise)) === BigDecimal.INFLATED) {
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

            if (newScale === yscale) {
                quotient = BigDecimal.divideAndRound2(
                    xs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
                let scaledYs;
                if ((scaledYs = BigDecimal.numberMultiplyPowerTen(ys, raise)) === BigDecimal.INFLATED) {
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

        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide3(
        xs: number, xscale: number, ys: BigInt, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        if (BigDecimal.compareMagnitudeNormalized2(xs, xscale, ys, yscale) > 0) {
            yscale -= 1;
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

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

        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide4(
        xs: BigInt, xscale: number, ys: number, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {
        if ((-BigDecimal.compareMagnitudeNormalized2(ys, yscale, xs, xscale)) > 0) {
            yscale -= 1;
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

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
            if (newScale === yscale) {
                quotient = BigDecimal.divideAndRound4(
                    xs, ys, scl, roundingMode, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                const raise = BigDecimal.checkScaleNonZero(newScale - yscale);
                let scaledYs;
                if ((scaledYs = BigDecimal.numberMultiplyPowerTen(ys, raise)) === BigDecimal.INFLATED) {
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
        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static divide5(
        xs: BigInt, xscale: number, ys: BigInt, yscale: number, preferredScale: number, mc: MathContext
    ): BigDecimal {

        if (BigDecimal.compareMagnitudeNormalized3(xs, xscale, ys, yscale) > 0) {
            yscale -= 1;
        }
        const mcp = mc.precision;
        const roundingMode = mc.roundingMode;

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

        return BigDecimal.doRound(quotient, mc);
    }

    divideToIntegralValue(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        if (!mc || (mc && (mc.precision === 0 || this.compareMagnitude(divisor) < 0))) {
            const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);
            if (this.compareMagnitude(divisor) < 0) {
                return BigDecimal.zeroValueOf(preferredScale);
            }

            if (this.signum() === 0 && divisor.signum() !== 0)
                return this.setScale(preferredScale, RoundingMode.UNNECESSARY);

            const maxDigits = Math.min(
                this.getPrecision() + Math.ceil(10.0 * divisor.getPrecision() / 3.0) + Math.abs(this._scale - divisor._scale) + 2,
                Number.MAX_SAFE_INTEGER
            );
            let quotient = this.divide(divisor, new MathContext(maxDigits, RoundingMode.DOWN));
            if (quotient._scale > 0) {
                quotient = quotient.setScale(0, RoundingMode.DOWN);
                quotient = BigDecimal.stripZerosToMatchScale(
                    quotient.intVal!, quotient.intCompact, quotient._scale, preferredScale
                );
            }

            if (quotient._scale < preferredScale) {
                quotient = quotient.setScale(preferredScale, RoundingMode.UNNECESSARY);
            }

            return quotient;
        }
        const preferredScale = BigDecimal.saturateScale(this._scale - divisor._scale);

        let result = this.divide(divisor, new MathContext(mc.precision, RoundingMode.DOWN));

        if (result._scale < 0) {
            const product = result.multiply(divisor);
            if (this.subtract(product).compareMagnitude(divisor) >= 0) {
                throw new RangeError('Division impossible');
            }
        } else if (result._scale > 0) {
            result = result.setScale(0, RoundingMode.DOWN);
        }
        let precisionDiff;
        if ((preferredScale > result._scale) &&
            (precisionDiff = mc.precision - result.getPrecision()) > 0) {
            return result.setScale(result._scale + Math.min(precisionDiff, preferredScale - result._scale));
        } else {
            return BigDecimal.stripZerosToMatchScale(result.intVal!, result.intCompact, result._scale, preferredScale);
        }
    }

    remainder(divisor: BigDecimal, mc?: MathContext): BigDecimal {
        return this.divideAndRemainder(divisor, mc)[1];
    }

    /** @internal */
    private compareMagnitude(val: BigDecimal): number {

        let ys = val.intCompact;
        let xs = this.intCompact;
        if (xs === 0)
            return (ys === 0) ? 0 : -1;
        if (ys === 0)
            return 1;

        const sdiff = this._scale - val._scale;
        if (sdiff !== 0) {
            const xae = this.getPrecision() - this._scale;
            const yae = val.getPrecision() - val._scale;
            if (xae < yae)
                return -1;
            if (xae > yae)
                return 1;
            if (sdiff < 0) {
                if (sdiff > Number.MIN_SAFE_INTEGER &&
                    (xs === BigDecimal.INFLATED ||
                        (xs = BigDecimal.numberMultiplyPowerTen(xs, -sdiff)) === BigDecimal.INFLATED) &&
                    ys === BigDecimal.INFLATED) {
                    const rb = this.bigMultiplyPowerTen(-sdiff);
                    return BigDecimal.bigIntCompareMagnitude(rb, val.intVal!);
                }
            } else {
                if (sdiff <= Number.MAX_SAFE_INTEGER &&
                    (ys === BigDecimal.INFLATED ||
                        (ys = BigDecimal.numberMultiplyPowerTen(ys, sdiff)) === BigDecimal.INFLATED) &&
                    xs === BigDecimal.INFLATED) {
                    const rb = val.bigMultiplyPowerTen(sdiff);
                    return BigDecimal.bigIntCompareMagnitude(this.intVal!, rb);
                }
            }
        }
        if (xs !== BigDecimal.INFLATED)
            return (ys !== BigDecimal.INFLATED) ? BigDecimal.numberCompareMagnitude(xs, ys) : -1;
        else if (ys !== BigDecimal.INFLATED)
            return 1;
        else
            return BigDecimal.bigIntCompareMagnitude(this.intVal!, val.intVal!);
    }

    equals(value: BigDecimal): boolean {
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

    divideAndRemainder(divisor: BigDecimal, mc?: MathContext): [BigDecimal, BigDecimal] {
        divisor = BigDecimal.convertToBigDecimal(divisor);
        const result = new Array<BigDecimal>(2);

        result[0] = this.divideToIntegralValue(divisor, mc);
        result[1] = this.subtract(result[0].multiply(divisor));
        return <[BigDecimal, BigDecimal]>result;

    }

    sqrt(mc: MathContext): BigDecimal {
        const signum = this.signum();
        if (signum !== 1) {
            let result = null;
            switch (signum) {
            case -1:
                throw new RangeError('Attempted square root of negative BigDecimal');
            case 0:
                result = BigDecimal.fromNumber3(0, Math.trunc(this._scale / 2));
                return result;

            default:
                throw new RangeError('Bad value from signum');
            }
        } else {

            const preferredScale = Math.trunc(this._scale / 2);
            const zeroWithFinalPreferredScale = BigDecimal.fromNumber3(0, preferredScale);

            const stripped = this.stripTrailingZeros();
            const strippedScale = stripped._scale;

            if (stripped.isPowerOfTen() && strippedScale % 2 === 0) {
                let result = BigDecimal.fromNumber3(1, Math.trunc(strippedScale / 2));
                if (result._scale !== preferredScale) {
                    result = result.add(zeroWithFinalPreferredScale, mc);
                }
                return result;
            }

            let scaleAdjust;
            const scale = stripped._scale - stripped.getPrecision() + 1;
            if (scale % 2 === 0) {
                scaleAdjust = scale;
            } else {
                scaleAdjust = scale - 1;
            }

            const working = stripped.scaleByPowerOfTen(scaleAdjust);

            const guess = BigDecimal.fromValue(Math.sqrt(working.numberValue()));
            let guessPrecision = 15;
            const originalPrecision = mc.precision;
            let targetPrecision;

            if (originalPrecision === 0) {
                targetPrecision = Math.trunc(stripped.getPrecision() / 2) + 1;
            } else {
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

            let approx = guess;
            const workingPrecision = working.getPrecision();
            do {
                const tmpPrecision = Math.max(Math.max(guessPrecision, targetPrecision + 2), workingPrecision);
                const mcTmp = new MathContext(tmpPrecision, RoundingMode.HALF_EVEN);

                approx = BigDecimal.ONE_HALF.multiply(approx.add(working.divide(approx, mcTmp), mcTmp));
                guessPrecision *= 2;
            } while (guessPrecision < targetPrecision + 2);

            let result;
            const targetRm = mc.roundingMode;
            if (targetRm === RoundingMode.UNNECESSARY || originalPrecision === 0) {
                const tmpRm = (targetRm === RoundingMode.UNNECESSARY) ? RoundingMode.DOWN : targetRm;
                const mcTmp = new MathContext(targetPrecision, tmpRm);
                result = approx.scaleByPowerOfTen(Math.trunc(-scaleAdjust / 2)).round(mcTmp);

                if (this.subtract(result.square()).compareTo(BigDecimal.ZERO) !== 0) {
                    throw new RangeError('Computed square root not exact.');
                }
            } else {
                result = approx.scaleByPowerOfTen(Math.trunc(-scaleAdjust / 2)).round(mc);

                switch (targetRm) {
                case RoundingMode.DOWN:
                case RoundingMode.FLOOR:
                    if (result.square().compareTo(this) > 0) {
                        let ulp = result.ulp();
                        if (approx.compareTo(BigDecimal.ONE) === 0) {
                            ulp = ulp.multiply(BigDecimal.ONE_TENTH);
                        }
                        result = result.subtract(ulp);
                    }
                    break;

                case RoundingMode.UP:
                case RoundingMode.CEILING:
                    if (result.square().compareTo(this) < 0) {
                        result = result.add(result.ulp());
                    }
                    break;

                default:
                    break;
                }

            }
            if (result._scale !== preferredScale) {
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

    ulp(): BigDecimal {
        return BigDecimal.fromNumber2(1, this._scale, 1);
    }

    /** @internal */
    private static bigIntSignum(val: BigInt): number {
        return val > 0n ? 1 : (val < 0n ? -1 : 0);
    }

    stripTrailingZeros(): BigDecimal {
        if (this.intCompact === 0 || (this.intVal !== null && BigDecimal.bigIntSignum(this.intVal!) === 0)) {
            return BigDecimal.ZERO;
        } else if (this.intCompact !== BigDecimal.INFLATED) {
            return BigDecimal.createAndStripZerosToMatchScale(this.intCompact, this._scale, Number.MIN_SAFE_INTEGER);
        } else {
            return BigDecimal.createAndStripZerosToMatchScale2(this.intVal!, this._scale, Number.MIN_SAFE_INTEGER);
        }
    }

    /** @internal */
    private isPowerOfTen(): boolean {
        return this.unscaledValue() === 1n;
    }

    unscaledValue(): BigInt {
        return this.inflated();
    }

    scale(): number {
        return this._scale;
    }

    scaleByPowerOfTen(n: number): BigDecimal {
        return new BigDecimal(this.intVal, this.intCompact, this.checkScale(this._scale - n), this.precision);
    }

    compareTo(val: BigDecimal): number {
        val = BigDecimal.convertToBigDecimal(val);
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

    numberValue(): number {
        if (this.intCompact !== BigDecimal.INFLATED) {
            if (this._scale === 0) {
                return this.intCompact;
            } else {
                if (Math.abs(this.intCompact) < Number.MAX_SAFE_INTEGER) {
                    if (this._scale > 0 && this._scale <= BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact / BigDecimal.NUMBER_10_POW[this._scale];
                    } else if (this._scale < 0 && this._scale >= -BigDecimal.MAX_COMPACT_DIGITS) {
                        return this.intCompact * BigDecimal.NUMBER_10_POW[-this._scale];
                    }
                }
            }
        }
        return Number(this.toString());
    }

    round(mc: MathContext): BigDecimal {
        return this.plus(mc);
    }

    setScale(newScale: number, roundingMode: RoundingMode = RoundingMode.UNNECESSARY): BigDecimal {
        if (roundingMode < RoundingMode.UP || roundingMode > RoundingMode.UNNECESSARY)
            throw new RangeError('Invalid rounding mode');

        const oldScale = this._scale;
        if (newScale === oldScale)
            return this;
        if (this.signum() === 0)
            return BigDecimal.zeroValueOf(newScale);
        if (this.intCompact !== BigDecimal.INFLATED) {
            let rs = this.intCompact;
            if (newScale > oldScale) {
                const raise = this.checkScale(newScale - oldScale);
                if ((rs = BigDecimal.numberMultiplyPowerTen(rs, raise)) !== BigDecimal.INFLATED) {
                    return BigDecimal.fromNumber3(rs, newScale);
                }
                const rb = this.bigMultiplyPowerTen(raise);
                return new BigDecimal(
                    rb, BigDecimal.INFLATED, newScale, (this.precision > 0) ? this.precision + raise : 0
                );
            } else {
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
                    rb, BigDecimal.INFLATED, newScale, (this.precision > 0) ? this.precision + raise : 0
                );
            } else {
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

    plus(mc?: MathContext): BigDecimal {
        if (!mc) return this;
        if (mc.precision === 0)
            return this;
        return BigDecimal.doRound(this, mc);
    }

    pow(n: number, mc?: MathContext): BigDecimal {
        if (!mc || (mc && mc.precision === 0)) {
            if (n < 0 || n > 999999999)
                throw new RangeError('Invalid operation');
            const newScale = this.checkScale(this._scale * n);
            return BigDecimal.fromBigInt5(this.inflated().valueOf() ** BigInt(n), newScale, 0);
        }
        if (n < -999999999 || n > 999999999)
            throw new RangeError('Invalid operation');
        if (n === 0)
            return BigDecimal.ONE;
        let workmc = mc;
        let mag = Math.abs(n);
        if (mc.precision > 0) {
            const elength = BigDecimal.numberDigitLength(mag);
            if (elength > mc.precision)
                throw new RangeError('Invalid operation');
            workmc = new MathContext(mc.precision + elength + 1, mc.roundingMode);
        }
        let acc = BigDecimal.ONE;
        let seenbit = false;
        for (let i = 1; ; i++) {
            mag += mag;
            if (mag < 0) {
                seenbit = true;
                acc = acc.multiply(this, workmc);
            }
            if (i === 31)
                break;
            if (seenbit)
                acc = acc.multiply(acc, workmc);
        }
        if (n < 0)
            acc = BigDecimal.ONE.divide(acc, workmc);
        return BigDecimal.doRound(acc, mc);
    }

    abs(mc?: MathContext): BigDecimal {
        return this.signum() < 0 ? this.negate(mc) : this.plus(mc);
    }

    /** @internal */
    private static divideAndRound2(
        ldividend: number, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        const q = Math.trunc(ldividend / ldivisor);
        if (roundingMode === RoundingMode.DOWN && scale === preferredScale)
            return BigDecimal.fromNumber3(q, scale);
        const r = ldividend % ldivisor;
        const qsign = ((ldividend < 0) === (ldivisor < 0)) ? 1 : -1;
        if (r !== 0) {
            const increment = BigDecimal.needIncrement(ldivisor, roundingMode, qsign, q, r);
            return BigDecimal.fromNumber3((increment ? q + qsign : q), scale);
        } else {
            if (preferredScale !== scale)
                return BigDecimal.createAndStripZerosToMatchScale(q, scale, preferredScale);
            else
                return BigDecimal.fromNumber3(q, scale);
        }
    }

    /** @internal */
    private static needIncrement(ldivisor: number, roundingMode: RoundingMode, qsign: number, q: number, r: number) {
        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1;
        } else {
            cmpFracHalf = BigDecimal.numberCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, (q & 1) !== 0);
    }

    /** @internal */
    private static commonNeedIncrement(
        roundingMode: RoundingMode, qsign: number, cmpFracHalf: number, oddQuot: boolean
    ): boolean {
        switch (roundingMode) {
        case RoundingMode.UNNECESSARY:
            throw new RangeError('Rounding necessary');

        case RoundingMode.UP:
            return true;

        case RoundingMode.DOWN:
            return false;

        case RoundingMode.CEILING:
            return qsign > 0;

        case RoundingMode.FLOOR:
            return qsign < 0;

        default:
            if (cmpFracHalf < 0)
                return false;
            else if (cmpFracHalf > 0)
                return true;
            else {
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
    private static numberCompareMagnitude(x: number, y: number): number {
        if (x < 0)
            x = -x;
        if (y < 0)
            y = -y;
        return (x < y) ? -1 : ((x === y) ? 0 : 1);
    }

    /** @internal */
    private static bigIntCompareMagnitude(x: BigInt, y: BigInt): number {
        if (x < 0n)
            x = -1n * x.valueOf();
        if (y < 0n)
            y = -1n * y.valueOf();
        return (x < y) ? -1 : ((x === y) ? 0 : 1);
    }

    /** @internal */
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

    /** @internal */
    private static bigIntToCompactValue(bigInt: BigInt, qsign: number): number {
        if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER) && bigInt >= BigInt(Number.MIN_SAFE_INTEGER)) {
            return qsign * Number(bigInt);
        } else {
            return BigDecimal.INFLATED;
        }
    }

    /** @internal */
    private static divideAndRound3(
        bdividend: BigInt, bdivisor: BigInt, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        const qsign = (BigDecimal.bigIntSignum(bdividend) !== BigDecimal.bigIntSignum(bdivisor)) ? -1 : 1;

        if (bdividend < 0n) bdividend = bdividend.valueOf() * -1n;
        if (bdivisor < 0n) bdivisor = bdivisor.valueOf() * -1n;

        let mq = bdividend.valueOf() / bdivisor.valueOf();
        const mr = bdividend.valueOf() % bdivisor.valueOf();
        const isRemainderZero = mr === 0n;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement2(bdivisor, roundingMode, qsign, mq, mr)) {
                mq += BigInt(1);
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

    /** @internal */
    private static needIncrement2(
        mdivisor: BigInt, roundingMode: RoundingMode, qsign: number, mq: BigInt, mr: BigInt
    ): boolean {
        const cmpFracHalf = BigDecimal.compareHalf(mr, mdivisor);
        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, mq.valueOf() % 2n === 1n);
    }

    /** @internal */
    private static compareHalf(mr: BigInt, mq: BigInt): number {
        mq = mq.valueOf() / 2n;
        if (mr < mq) return -1;
        if (mr > mq) return 1;
        return 0;
    }

    /** @internal */
    private static divideAndRound4(
        bdividend: BigInt, ldivisor: number, scale: number, roundingMode: RoundingMode, preferredScale: number
    ): BigDecimal {
        const divisorNegative = ldivisor < 0;
        const dividendSignum = BigDecimal.bigIntSignum(bdividend);

        if (divisorNegative) ldivisor *= -1;
        if (dividendSignum === -1) bdividend = bdividend.valueOf() * -1n;

        let mq = bdividend.valueOf() / BigInt(ldivisor);
        let mr: number;

        const bDividendNumber = Number(bdividend);

        if (Number.isSafeInteger(bDividendNumber)) {
            mr = bDividendNumber % ldivisor;
        } else {
            mr = Number(bdividend.valueOf() % BigInt(ldivisor));
        }

        const isRemainderZero = mr === 0;
        const qsign = divisorNegative ? -dividendSignum : dividendSignum;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement3(ldivisor, roundingMode, qsign, mq, mr)) {
                mq += BigInt(1);
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

    /** @internal */
    private static needIncrement3(ldivisor: number, roundingMode: RoundingMode, qsign: number, mq: BigInt, r: number) {
        let cmpFracHalf;
        if (r <= BigDecimal.HALF_NUMBER_MIN_VALUE || r > BigDecimal.HALF_NUMBER_MAX_VALUE) {
            cmpFracHalf = 1;
        } else {
            cmpFracHalf = BigDecimal.numberCompareMagnitude(2 * r, ldivisor);
        }

        return BigDecimal.commonNeedIncrement(roundingMode, qsign, cmpFracHalf, mq.valueOf() % 2n === 1n);
    }

    movePointLeft(n: number): BigDecimal {
        if (n === 0) return this;

        const newScale = this.checkScale(this._scale + n);
        const num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num._scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    movePointRight(n: number): BigDecimal {
        if (n === 0) return this;

        const newScale = this.checkScale(this._scale - n);
        const num = new BigDecimal(this.intVal, this.intCompact, newScale, 0);
        return num._scale < 0 ? num.setScale(0, RoundingMode.UNNECESSARY) : num;
    }

    min(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) <= 0 ? this : val);
    }

    max(val: BigDecimal): BigDecimal {
        return (this.compareTo(val) >= 0 ? this : val);
    }

    toString(): string {
        let sc = this.stringCache;
        if (sc === undefined) {
            this.stringCache = sc = this.layoutChars(true);
        }
        return sc;
    }

    toEngineeringString(): string {
        return this.layoutChars(false);
    }

    /** @internal */
    private static bigIntAbs(val: BigInt) {
        if (val < 0n) {
            return val.valueOf() * -1n;
        } else return val;
    }

    /** @internal */
    private layoutChars(sci: boolean): string {
        if (this._scale === 0)
            return (this.intCompact !== BigDecimal.INFLATED) ? this.intCompact.toString() : this.intVal!.toString();

        if (this._scale === 2 && this.intCompact >= 0 && this.intCompact < Number.MAX_SAFE_INTEGER) {
            const lowInt = this.intCompact % 100;
            const highInt = Math.trunc(this.intCompact / 100);
            return (highInt.toString() + '.' + BigDecimal.DIGIT_TENS[lowInt] + BigDecimal.DIGIT_ONES[lowInt]);
        }

        let coeff;
        const offset = 0;
        if (this.intCompact !== BigDecimal.INFLATED) {
            coeff = Math.abs(this.intCompact).toString();
        } else {
            coeff = BigDecimal.bigIntAbs(this.intVal!).toString();
        }

        let buf = '';
        if (this.signum() < 0)
            buf += '-';
        const coeffLen = coeff.length - offset;
        let adjusted = -this._scale + (coeffLen - 1);
        if ((this._scale >= 0) && (adjusted >= -6)) {
            let pad = this._scale - coeffLen;
            if (pad >= 0) {
                buf += '0';
                buf += '.';
                for (; pad > 0; pad--) {
                    buf += '0';
                }
                buf += coeff.substr(offset, coeffLen);
            } else {
                buf += coeff.substr(offset, -pad);
                buf += '.';
                buf += coeff.substr(-pad + offset, this._scale);
            }
        } else {
            if (sci) {
                buf += coeff[offset];
                if (coeffLen > 1) {
                    buf += '.';
                    buf += coeff.substr(offset + 1, coeffLen - 1);
                }
            } else {
                let sig = (adjusted % 3);
                if (sig < 0)
                    sig += 3;
                adjusted -= sig;
                sig++;
                if (this.signum() === 0) {
                    switch (sig) {
                    case 1:
                        buf += '0';
                        break;
                    case 2:
                        buf += '0.00';
                        adjusted += 3;
                        break;
                    case 3:
                        buf += '0.0';
                        adjusted += 3;
                        break;
                    default:
                        throw new RangeError('Unexpected sig value ' + sig);
                    }
                } else if (sig >= coeffLen) {
                    buf += coeff.substr(offset, coeffLen);

                    for (let i = sig - coeffLen; i > 0; i--) {
                        buf += '0';
                    }
                } else {
                    buf += coeff.substr(offset, sig);
                    buf += '.';
                    buf += coeff.substr(offset + sig, coeffLen - sig);
                }
            }
            if (adjusted !== 0) {
                buf += 'E';
                if (adjusted > 0)
                    buf += '+';
                buf += adjusted.toString();
            }
        }
        return buf;
    }

    toPlainString(): string {
        if (this._scale === 0) {
            if (this.intCompact !== BigDecimal.INFLATED) {
                return this.intCompact.toString();
            } else {
                return this.intVal!.toString();
            }
        }
        if (this._scale < 0) {
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

    /** @internal */
    private static getValueString(signum: number, intString: string, scale: number): string {
        /* Insert decimal point */
        let buf = '';
        const insertionPoint = intString.length - scale;
        if (insertionPoint === 0) { /* Point goes right before intVal */
            return (signum < 0 ? '-0.' : '0.') + intString;
        } else if (insertionPoint > 0) { /* Point goes inside intVal */
            buf = buf.slice(0, insertionPoint) + '.' + buf.slice(insertionPoint);
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

    toBigInt(): BigInt {
        return this.setScale(0, RoundingMode.DOWN).inflated();
    }

    toBigIntExact(): BigInt {
        return this.setScale(0, RoundingMode.UNNECESSARY).inflated();
    }

    /** @internal */
    private static divideAndRound5(bdividend: BigInt, ldivisor: number, roundingMode: number): BigInt {

        const dividendSignum = BigDecimal.bigIntSignum(bdividend);
        const divisorNegative = ldivisor < 0;

        if (dividendSignum === -1) bdividend = bdividend.valueOf() * -1n;
        if (divisorNegative) ldivisor *= -1;

        let mq = bdividend.valueOf() / BigInt(ldivisor);
        let r: number;

        const bDividendNumber = Number(bdividend);

        if (Number.isSafeInteger(bDividendNumber)) {
            r = bDividendNumber % ldivisor;
        } else {
            r = Number(bdividend.valueOf() % BigInt(ldivisor));
        }

        const isRemainderZero = (r === 0);

        const qsign = divisorNegative ? (dividendSignum * -1) : dividendSignum;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement3(ldivisor, roundingMode, qsign, mq, r)) {
                mq += 1n;
            }
        }
        return mq * BigInt(qsign);
    }

    /** @internal */
    private static divideAndRound6(bdividend: BigInt, bdivisor: BigInt, roundingMode: number): BigInt {
        const bdividendSignum = BigDecimal.bigIntSignum(bdividend);
        const bdivisorSignum = BigDecimal.bigIntSignum(bdivisor);

        if (bdividend < 0n) bdividend = bdividend.valueOf() * -1n;
        if (bdivisor < 0n) bdivisor = bdivisor.valueOf() * -1n;

        let mq = bdividend.valueOf() / bdivisor.valueOf();
        const mr = bdividend.valueOf() % bdivisor.valueOf();
        const isRemainderZero = mr === 0n;
        const qsign = (bdividendSignum !== bdivisorSignum) ? -1 : 1;
        if (!isRemainderZero) {
            if (BigDecimal.needIncrement2(bdivisor, roundingMode, qsign, mq, mr)) {
                mq += 1n;
            }
        }
        return mq * BigInt(qsign);
    }

    /** @internal */
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

        const xraise = yscale - xscale;
        const scaledX = (xraise === 0) ? xs : BigDecimal.numberMultiplyPowerTen(xs, xraise);
        let quotient;

        const cmp = BigDecimal.numberCompareMagnitude(scaledX, ys);
        if (cmp > 0) {
            yscale -= 1;
            const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
            if (BigDecimal.checkScaleNonZero(mcp + yscale - xscale) > 0) {

                const raise = BigDecimal.checkScaleNonZero(mcp + yscale - xscale);
                const scaledXs = BigDecimal.numberMultiplyPowerTen(xs, raise);
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
                    const scaledYs = BigDecimal.numberMultiplyPowerTen(ys, raise);
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

            const scl = BigDecimal.checkScaleNonZero(preferredScale + yscale - xscale + mcp);
            if (cmp === 0) {

                quotient = BigDecimal.roundedTenPower(
                    ((scaledX < 0) === (ys < 0)) ? 1 : -1, mcp, scl, BigDecimal.checkScaleNonZero(preferredScale)
                );
            } else {
                const scaledXs = BigDecimal.numberMultiplyPowerTen(scaledX, mcp);
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
        return BigDecimal.doRound(quotient, mc);
    }

    /** @internal */
    private static roundedTenPower(qsign: number, raise: number, scale: number, preferredScale: number): BigDecimal {
        if (scale > preferredScale) {
            const diff = scale - preferredScale;
            if (diff < raise) {
                return BigDecimal.scaledTenPow(raise - diff, qsign, preferredScale);
            } else {
                return BigDecimal.fromNumber3(qsign, scale - raise);
            }
        } else {
            return BigDecimal.scaledTenPow(raise, qsign, scale);
        }
    }

    /** @internal */
    private static scaledTenPow(n: number, sign: number, scale: number): BigDecimal {
        if (n < BigDecimal.TEN_POWERS_TABLE.length)
            return BigDecimal.fromNumber3(sign * BigDecimal.TEN_POWERS_TABLE[n], scale);
        else {
            let unscaledVal = BigInt(10) ** BigInt(n);
            if (sign === -1) {
                unscaledVal = unscaledVal * -1n;
            }
            return new BigDecimal(unscaledVal, BigDecimal.INFLATED, scale, n + 1);
        }
    }

    /** @internal */
    private static compareMagnitudeNormalized(xs: number, xscale: number, ys: number, yscale: number): number {

        const sdiff = xscale - yscale;
        if (sdiff !== 0) {
            if (sdiff < 0) {
                xs = BigDecimal.numberMultiplyPowerTen(xs, -sdiff);
            } else {
                ys = BigDecimal.numberMultiplyPowerTen(ys, sdiff);
            }
        }
        if (xs !== BigDecimal.INFLATED)
            return (ys !== BigDecimal.INFLATED) ? BigDecimal.numberCompareMagnitude(xs, ys) : -1;
        else
            return 1;
    }

    /** @internal */
    private static compareMagnitudeNormalized2(xs: number, xscale: number, ys: BigInt, yscale: number): number {

        if (xs === 0)
            return -1;
        const sdiff = xscale - yscale;
        if (sdiff < 0) {
            if (BigDecimal.numberMultiplyPowerTen(xs, -sdiff) === BigDecimal.INFLATED) {
                return BigDecimal.bigIntCompareMagnitude(BigDecimal.bigMultiplyPowerTen2(xs, -sdiff), ys);
            }
        }
        return -1;
    }

    /** @internal */
    private static compareMagnitudeNormalized3(xs: BigInt, xscale: number, ys: BigInt, yscale: number): number {
        const sdiff = xscale - yscale;
        if (sdiff < 0) {
            return BigDecimal.bigIntCompareMagnitude(BigDecimal.bigMultiplyPowerTen3(xs, -sdiff), ys);
        } else {
            return BigDecimal.bigIntCompareMagnitude(xs, BigDecimal.bigMultiplyPowerTen3(ys, sdiff));
        }
    }
}

interface BigInterface {
    (n: any, scale?: number, mc?: MathContext): BigDecimal;

    new(n: any, scale?: number, mc?: MathContext): BigDecimal;
}

function _Big(n: any, scale?: number, mc?: MathContext): BigDecimal {
    return BigDecimal.fromValue(n, scale, mc);
}

/**
 * Constructor function. Can be invoked with new or without new.
 *
 * Sample Usage:
 *```javascript
 * const { Big } = require('bigdecimal.js');
 *
 * // Constructor accepts any value such as string and BigDecimal itself:
 *
 * const x = Big('1.1111111111111111111111');
 * const y = Big(x);
 *
 * const z = x.add(y);
 * console.log(z.toString()); // 2.2222222222222222222222
 *
 *
 * const u = Big(1.1);
 * const v = Big(2n);
 *
 * // You can also construct a BigDecimal from a number or a BigInt:
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
 *     * Value is not a number
 *     * Value is not in the range [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
 *     * A scale is not provided but a precision is provided
 * * If value is converted to string internally and the string format is invalid.
 */
export const Big: BigInterface = <BigInterface>_Big;
