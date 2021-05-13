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
node benchmarks/add_mul.js
echo '----------'
node benchmarks/add_mul_big.js
echo '----------'
