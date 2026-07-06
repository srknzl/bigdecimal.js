import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * Batched test-case runner. Instead of spawning one JVM per case (which is ~549k
 * JVM startups and hours of wall time), the generator spawns ONE JVM per
 * operation and streams every case for that op through stdin — one
 * space-separated arg list per line. This class prints one result line per input
 * line, or the literal "errorThrown" when that case would throw (mirroring the
 * old stderr sentinel). Each op's expression is transcribed verbatim from the
 * original per-op programs in util/java/*.java.
 *
 * Usage: java -cp util/batch Main <OpName>   (cases on stdin)
 */
public class Main {
    public static void main(String[] argv) throws IOException {
        String op = argv[0];
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            if (line.isEmpty()) {
                continue;
            }
            String[] a = line.split(" ");
            String result;
            try {
                result = compute(op, a);
            } catch (Exception e) {
                result = "errorThrown";
            }
            out.append(result).append('\n');
        }
        System.out.print(out);
    }

    private static MathContext mc(String[] a, int i) {
        return new MathContext(Integer.parseInt(a[i]), RoundingMode.valueOf(Integer.parseInt(a[i + 1])));
    }

    private static RoundingMode rm(String[] a, int i) {
        return RoundingMode.valueOf(Integer.parseInt(a[i]));
    }

    private static String compute(String op, String[] a) {
        switch (op) {
            case "Abs":
                return new BigDecimal(a[0]).abs(mc(a, 1)).toString();
            case "Negate":
                return new BigDecimal(a[0]).negate(mc(a, 1)).toString();
            case "Plus":
                return new BigDecimal(a[0]).plus(mc(a, 1)).toString();
            case "Round":
                return new BigDecimal(a[0]).round(mc(a, 1)).toString();
            case "NumberValue":
                return String.valueOf(new BigDecimal(a[0]).doubleValue());
            case "Precision":
                return String.valueOf(new BigDecimal(a[0]).precision());
            case "Scale":
                return String.valueOf(new BigDecimal(a[0]).scale());
            case "Signum":
                return String.valueOf(new BigDecimal(a[0]).signum());
            case "StripTrailingZeros":
                return new BigDecimal(a[0]).stripTrailingZeros().toString();
            case "ToBigInt":
                return new BigDecimal(a[0]).toBigInteger().toString();
            case "ToBigIntExact":
                return new BigDecimal(a[0]).toBigIntegerExact().toString();
            case "ToEngineeringString":
                return new BigDecimal(a[0]).toEngineeringString();
            case "ToPlainString":
                return new BigDecimal(a[0]).toPlainString();
            case "Ulp":
                return new BigDecimal(a[0]).ulp().toString();
            case "UnscaledValue":
                return new BigDecimal(a[0]).unscaledValue().toString();
            case "MovePointLeft":
                return new BigDecimal(a[0]).movePointLeft(Integer.parseInt(a[1])).toString();
            case "MovePointRight":
                return new BigDecimal(a[0]).movePointRight(Integer.parseInt(a[1])).toString();
            case "ScaleByPowerOfTen":
                return new BigDecimal(a[0]).scaleByPowerOfTen(Integer.parseInt(a[1])).toString();
            case "SetScale":
                return new BigDecimal(a[0]).setScale(Integer.parseInt(a[1]), rm(a, 2)).toString();
            case "Pow":
                return new BigDecimal(a[0]).pow(Integer.parseInt(a[1]), mc(a, 2)).toString();
            case "Sqrt":
                return new BigDecimal(a[0]).sqrt(mc(a, 1)).toString();
            case "Add":
                return new BigDecimal(a[0]).add(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "Subtract":
                return new BigDecimal(a[0]).subtract(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "Multiply":
                return new BigDecimal(a[0]).multiply(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "Divide":
                return new BigDecimal(a[0]).divide(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "Divide2":
                return new BigDecimal(a[0]).divide(new BigDecimal(a[1])).toString();
            case "Divide3":
                return new BigDecimal(a[0]).divide(new BigDecimal(a[1]), rm(a, 2)).toString();
            case "Divide4":
                return new BigDecimal(a[0]).divide(new BigDecimal(a[1]), Integer.parseInt(a[2]), rm(a, 3)).toString();
            case "DivideToIntegralValue":
                return new BigDecimal(a[0]).divideToIntegralValue(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "Remainder":
                return new BigDecimal(a[0]).remainder(new BigDecimal(a[1]), mc(a, 2)).toString();
            case "DivideAndRemainder": {
                BigDecimal[] r = new BigDecimal(a[0]).divideAndRemainder(new BigDecimal(a[1]), mc(a, 2));
                return r[0].toString() + " " + r[1].toString();
            }
            case "CompareTo":
                return String.valueOf(new BigDecimal(a[0]).compareTo(new BigDecimal(a[1])));
            case "Equals":
                return String.valueOf(new BigDecimal(a[0]).equals(new BigDecimal(a[1])));
            case "Max":
                return new BigDecimal(a[0]).max(new BigDecimal(a[1])).toString();
            case "Min":
                return new BigDecimal(a[0]).min(new BigDecimal(a[1])).toString();
            case "ToString":
                return new BigDecimal(new BigInteger(a[0]), Integer.parseInt(a[1]), mc(a, 2)).toString();
            default:
                throw new IllegalArgumentException("Unknown op: " + op);
        }
    }
}
