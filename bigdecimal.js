
// Implementation of big decimal with BigInt
class BigDecimal {

    constructor(scale, precision, intVal) {
        this.scale = scale;
        this.precision = precision;
        this.intVal = intVal;
    }

    parseExp(value, offset, len) {
        return 0;
    }

    add(other) {
        const scaleDiff = this.scale - other.scale;
        if (scaleDiff === 0) {
            return new BigDecimal(this.scale, 0, this.intVal + other.intVal);
        } else if (scaleDiff < 0) {
            const bigSum = (this.intVal * (BigInt(10) ** BigInt(-1 * scaleDiff))) + other.intVal;
            return new BigDecimal(other.scale, 0, bigSum)
        } else {
            const bigSum = (other.intVal * (BigInt(10) ** BigInt(scaleDiff))) + this.intVal;
            return new BigDecimal(this.scale, 0, bigSum)
        }
    }

    multiply(other) {
        const scale = this.scale + other.scale;
        return new BigDecimal(scale, 0, this.intVal * other.intVal);
    }

    toString() {
        if (this.scale === 0) {
            return this.intVal.toString();
        }

        if (this.scale < 0) {
            if (this.intVal === BigInt(0)) return "0";
            let str = this.intVal.toString();
            for (let i = 0; i < this.scale; i++) {
                str += "0";
            }
            return str;
        }
        const negative = this.intVal < 0;
        let str = this.intVal.toString();
        let insertionPoint = str.length - this.scale;
        if (insertionPoint === 0) {
            return (negative ? "-0." : "0.") + str;
        } else if (insertionPoint > 0) {
            let res = '';
            for (let i = 0; i < str.length; i++) {
                if (i === insertionPoint) {
                    res += '.'
                }
                res += str[i];
            }
            return res;
        } else {
            let res = (negative ? "-0." : "0.");
            for (let i = 0; i < -1 * insertionPoint; i++) {
                res += '0'
            }
            res += str;
            return res;
        }
    }

    static fromString(value) {
        let prec = 0;
        let scl = 0;
        let rb;

        let offset = 0;
        let len = value.length;

        try {
            let isneg = false;
            if (value[offset] === '-') {
                isneg = true;
                offset++;
                len--;
            } else if (value[offset] === '+') {
                offset++;
                len--;
            }
            let dot = false;
            let exp = 0;
            let c;
            let idx = 0;
            if (false) {
                // todo
            } else {
                let coeff = [];
                for (; len > 0; offset++, len--) {
                    c = value[offset];
                    if (c >= '0' && c <= '9') {
                        if (c == '0') {
                            if (prec == 0) {
                                coeff[idx] = c;
                                prec = 1;
                            } else if (idx != 0) {
                                coeff[idx++] = c;
                                prec++;
                            }
                        } else {
                            if (prec != 1 || idx != 0) prec++;
                            coeff[idx++] = c;
                        }
                        if (dot) scl++;
                        continue;
                    }
                    if (c == '.') {
                        if (dot) {
                            throw new Error('Two dots')
                        }
                        dot = true;
                        continue;
                    }
                    if ((c != 'e') && (c != 'E')) {
                        throw new Error('missing exp notation');
                    }
                    exp = BigDecimal.parseExp(value, offset, len);
                    // todo parse Exp
                    break;
                }
                if (prec == 0) {
                    throw new Error('no digits');
                }
                if (exp != 0) { // had significant exponent
                    // todo
                }
                const stringValue = coeff.join('');

                if (isneg) rb = BigInt('-' + stringValue)
                else rb = BigInt(stringValue);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
        return new BigDecimal(scl, prec, rb);
    }
}
module.exports = BigDecimal;
