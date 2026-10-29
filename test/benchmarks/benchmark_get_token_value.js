// benchmark_get_token_value.js
// Measures performance gain of storing tokens[name] in a local variable vs double property lookup.

const { getTokenValue } = require('../../src/tokenmanager');

const tokens = Object.assign(Object.create(null), {
    benchmark_token_1: 100,
    benchmark_token_2: 200
});

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

const iterations = 5000000;
const testKeys = ['benchmark_token_1', 'benchmark_token_2', 'non_existent_token'];

console.log('--- Benchmarking Token Lookup Property Optimization (5,000,000 iterations x 3 keys) ---');

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValueUnoptimized(key);
        getTokenValue(key);
    }
}

// Unoptimized
const startUnopt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testKeys) {
        getTokenValueUnoptimized(key);
    }
}
const endUnopt = parseFloat(process.hrtime.bigint()) / 1e6;
const unoptTime = endUnopt - startUnopt;
console.log(`Unoptimized (Double Lookup): ${unoptTime.toFixed(4)}ms`);

// Optimized
const startOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testKeys) {
        getTokenValue(key);
    }
}
const endOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const optTime = endOpt - startOpt;
console.log(`Optimized (Local Variable Lookup): ${optTime.toFixed(4)}ms`);

const speedup = ((unoptTime - optTime) / unoptTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
