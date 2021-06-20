## Test Generation Utilities

* To test methods of Node.js BigDecimal library, auto-generated tests are used. The aim is to make Node.js implementation as 
close as possible to the Java implementation of BigDecimal.


### Methodology 

1. The numbers in test-numbers.js and random numbers for precision and rounding mode are passed to pre-compiled java programs
that are in com folder. 
2. The java programs parse command line arguments, build BigDecimals with them, compute the result and print the result to the console.
3. Test case generator scripts ([one operator generator](oneOperator.js) and [two operator generator](twoOperator.js)) check for stderr of java program.
4. If stderr is non-empty, an error is thrown from java program; in that case the result becomes `errorThrown` which means Nodejs version of
BigDecimal library should also throw an error. Errors are thrown in case of rounding errors etc.
5. [One operator generator script](oneOperator.js) is for operations with one operator such as absolute value and square root, 
whereas [two operator generator script](twoOperator.js) is for operations with two operator such as addition and division.
6. Tests are generated using the following java runtime:

```
openjdk version "16.0.1" 2021-04-20
OpenJDK Runtime Environment (build 16.0.1+9-Ubuntu-120.04)
OpenJDK 64-Bit Server VM (build 16.0.1+9-Ubuntu-120.04, mixed mode, sharing)
```
