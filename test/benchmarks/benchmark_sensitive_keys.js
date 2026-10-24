const { performance } = require('perf_hooks');

// Benchmark Array.prototype.includes vs Set.prototype.has for SENSITIVE_KEYS checks in tokenmanager.js
const SENSITIVE_KEYS_ARRAY = ['__proto__', 'constructor', 'prototype'];
const SENSITIVE_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

const testNames = [
    'Bitcoin',
    'EthereumX',
    'Solana',
    'Cardano',
    'Polkadot',
    'Dogecoin',
    'Avax',
    '__proto__',
    'Chainlink',
    'Uniswap'
];

const ITERATIONS = 10000000;

console.log(`--- Benchmarking SENSITIVE_KEYS Array.includes vs Set.has (${ITERATIONS.toLocaleString()} iterations) ---`);

// 1. Array.includes
const startArray = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const name = testNames[i % testNames.length];
    SENSITIVE_KEYS_ARRAY.includes(name);
}
const timeArray = performance.now() - startArray;

// 2. Set.has
const startSet = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const name = testNames[i % testNames.length];
    SENSITIVE_KEYS_SET.has(name);
}
const timeSet = performance.now() - startSet;

const speedup = ((timeArray - timeSet) / timeArray) * 100;

console.log(`Array.includes() Execution Time: ${timeArray.toFixed(4)}ms`);
console.log(`Set.has() Execution Time:       ${timeSet.toFixed(4)}ms`);
console.log(`Performance Gain: ${speedup.toFixed(2)}% faster\n`);
