import { BigDecimal } from './bigdecimal';

const x = BigDecimal('1.1111111111111111111111');
const y = new BigDecimal(2n);

const z = x.add(y);
console.log(z.toString()); // 2.2222222222222222222222
