/**
 * Benchmark comparing getTokenValue with duplicate property lookup vs single property lookup.
 */

const { performance } = require('perf_hooks');

const tokens = Object.create(null);
for (let i = 0; i < 50; i++) {
    tokens[`token_${i}`] = i * 10;
}

function getTokenValueOld(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOpt(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const testKeys = ['token_0', 'token_10', 'token_25', 'token_49', 'non_existent_token'];
const iterations = 5000000;

console.log(`--- Benchmarking getTokenValue Property Access (${iterations.toLocaleString()} iterations x ${testKeys.length} keys) ---`);

// Warm-up
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValueOld(key);
        getTokenValueOpt(key);
    }
}

const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
    for (let k = 0; k < testKeys.length; k++) {
        getTokenValueOld(testKeys[k]);
    }
}
const endOld = performance.now();
const oldDuration = endOld - startOld;
console.log(`Original (double property access): ${oldDuration.toFixed(2)}ms`);

const startOpt = performance.now();
for (let i = 0; i < iterations; i++) {
    for (let k = 0; k < testKeys.length; k++) {
        getTokenValueOpt(testKeys[k]);
    }
}
const endOpt = performance.now();
const optDuration = endOpt - startOpt;
console.log(`Optimized (single property access): ${optDuration.toFixed(2)}ms`);

const speedup = ((oldDuration - optDuration) / oldDuration) * 100;
console.log(`Performance Improvement:           ${speedup.toFixed(2)}% faster\n`);
