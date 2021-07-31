import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println(
                new BigDecimal(
                        new BigInteger(args[0]),
                        Integer.parseInt(args[1]),
                        new MathContext(Integer.parseInt(args[2]), RoundingMode.valueOf(Integer.parseInt(args[3])))
                )
        );
    }
}
