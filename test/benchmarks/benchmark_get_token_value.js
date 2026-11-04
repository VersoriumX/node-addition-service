/**
 * Benchmark comparing getTokenValue property lookup implementations:
 * Original (double property lookup `tokens[name] !== undefined ? tokens[name] : null`) vs
 * Optimized (single property lookup `const val = tokens[name]; return val !== undefined ? val : null`)
 */

const { performance } = require('perf_hooks');

const tokens = Object.assign(Object.create(null), {
    Bitcoin: 65000,
    Ethereum: 3500,
    Solana: 150,
    Cardano: 0.5
});

function getTokenValueOriginal(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const ITERATIONS = 10000000;
const testKeys = ['Bitcoin', 'Ethereum', 'UnknownToken', 'Solana', 'NonExistent'];

console.log(`--- Benchmarking getTokenValue Property Lookup (${ITERATIONS.toLocaleString()} iterations x ${testKeys.length} lookups) ---`);

// Warm-up
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValueOriginal(key);
        getTokenValueOptimized(key);
    }
}

const startOrig = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        getTokenValueOriginal(testKeys[j]);
    }
}
const endOrig = performance.now();
const origTime = endOrig - startOrig;

const startOpt = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        getTokenValueOptimized(testKeys[j]);
    }
}
const endOpt = performance.now();
const optTime = endOpt - startOpt;

const speedup = ((origTime - optTime) / origTime) * 100;
console.log(`Original (double lookup):   ${origTime.toFixed(2)}ms`);
console.log(`Optimized (single lookup):  ${optTime.toFixed(2)}ms`);
console.log(`Speedup:                   ${speedup.toFixed(2)}% faster\n`);
