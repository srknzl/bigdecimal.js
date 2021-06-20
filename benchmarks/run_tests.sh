#!/bin/bash
echo '----------Starting tests-------'
node benchmarks/add.js
echo '----------'
node benchmarks/add_big.js
echo '----------'
node benchmarks/mul.js
echo '----------'
node benchmarks/mul_big.js
echo '----------'
node benchmarks/subtract.js
echo '----------'
node benchmarks/subtract_big.js
echo '----------'
node benchmarks/divide.js
echo '----------'
node benchmarks/divide_big.js
echo '----------'
node benchmarks/abs.js
echo '----------'
node benchmarks/abs_big.js
echo '----------'
