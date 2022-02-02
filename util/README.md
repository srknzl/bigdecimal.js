## Test Generation Utilities

* To test Node.js BigDecimal library, auto-generated tests are used. The goal is to make Node.js implementation behave exactly same with the Java implementation regarding arithmetic operations.


### Methodology 

1. The numbers in test-numbers.js and random numbers for precision and rounding mode are passed to pre-compiled java programs
that are in com folder. 
2. The java programs parse command line arguments, build BigDecimals with them, compute the result and print the result to the console.
3. The [test case generator script](generateTestFiles.js) checks for stderr of java program.
4. If stderr is non-empty, an error is thrown from java program; in that case the result becomes `errorThrown` which means Nodejs version of
BigDecimal library should also throw an error. Errors are thrown in case of rounding errors etc.
5. [In the test generator script](generateTestFiles.js) there are operations with one operator such as absolute value and square root, 
and there are two operator operations such as addition and division. They are treated differently while generating the tests.
6. Tests are generated using the following java runtime:

```
openjdk version "16.0.1" 2021-04-20
OpenJDK Runtime Environment (build 16.0.1+9-Ubuntu-120.04)
OpenJDK 64-Bit Server VM (build 16.0.1+9-Ubuntu-120.04, mixed mode, sharing)
```
7. Generated test cases are in [output](output) folder as json files. For each method, there are thousands of tests generated.
