import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println((new BigDecimal(args[0])).divide(
                new BigDecimal(args[1])
        ));
    }
}
