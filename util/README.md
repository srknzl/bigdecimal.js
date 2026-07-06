## Test Generation Utilities

* To test Node.js BigDecimal library, auto-generated tests are used. The goal is to make Node.js implementation behave exactly same with the Java implementation regarding arithmetic operations.


### Methodology

1. The numbers in [testNumbers.js](testNumbers.js) plus random precision/scale/rounding-mode
values are turned into per-op argument lists by [generateTestFiles.js](generateTestFiles.js).
2. All cases for a single operation are streamed over **stdin** to one JVM running the batch
dispatcher [batch/Main.java](batch/Main.java) (`java -cp util/batch Main <OpName>`). It parses
each line, builds `BigDecimal`s, computes the result, and prints one result line per input line.
This replaces the old one-JVM-per-case model (~549k JVM startups, hours of wall time) — the full
suite now regenerates in seconds.
3. If a case would throw (rounding errors, non-terminating expansions, etc.), the dispatcher
catches it and prints the literal `errorThrown`, meaning the Node.js library must also throw for
that case.
4. Operations with one operand (e.g. abs, sqrt) and two operands (e.g. add, divide), and the two
ops that return a pair (`divideAndRemainder`), are handled by the shared `compute` switch in the
dispatcher.
5. The per-op `com/<Name>/Main.class` programs are the older argv-driven equivalents, kept as an
independent oracle to cross-check the batch output (see the sampling harness used during
regeneration).
6. Tests are generated using the following Java runtime (JDK 26 GA):

```
openjdk version "26.0.1" 2026-04-21
OpenJDK Runtime Environment (build 26.0.1+8-34)
OpenJDK 64-Bit Server VM (build 26.0.1+8-34, mixed mode, sharing)
```
7. Generated test cases are in [output](output) folder as json files. For each method, there are thousands of tests generated.

To regenerate: ensure `java` (JDK 26) is on `PATH`, recompile the dispatcher with
`javac -d util/batch util/batch/Main.java`, delete `util/output/*.json`, then
`npm run generate-test-files`.
