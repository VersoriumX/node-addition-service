const { performance } = require('perf_hooks');

const tokens = Object.create(null);
for (let i = 0; i < 100; i++) {
    tokens[`token_${i}`] = i * 10;
}

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const keys = Object.keys(tokens);
const iterations = 10000000;

console.log(`--- Benchmarking getTokenValue Single Property Lookup Optimization (${iterations.toLocaleString()} iterations) ---`);

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
    const key = keys[i % keys.length];
    getTokenValueUnoptimized(key);
}
const end1 = performance.now();
const timeUnoptimized = end1 - start1;

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
    const key = keys[i % keys.length];
    getTokenValueOptimized(key);
}
const end2 = performance.now();
const timeOptimized = end2 - start2;

console.log(`Unoptimized (double property lookup): ${timeUnoptimized.toFixed(2)}ms`);
console.log(`Optimized (single property lookup):   ${timeOptimized.toFixed(2)}ms`);
const speedup = (((timeUnoptimized - timeOptimized) / timeUnoptimized) * 100).toFixed(2);
console.log(`Estimated Performance Gain: ${speedup}% faster`);
