import java.math.BigDecimal;

public class Main {
    public static void main(String[] args) {
        System.out.println(new BigDecimal(args[0]).unscaledValue());
    }
}
