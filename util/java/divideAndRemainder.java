import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        BigDecimal[] result = (new BigDecimal(args[0])).divideAndRemainder(
                new BigDecimal(args[1]),
                new MathContext(Integer.parseInt(args[2]), RoundingMode.valueOf(Integer.parseInt(args[3])))
        );
        System.out.println(result[0] + " " + result[1]);
    }
}
