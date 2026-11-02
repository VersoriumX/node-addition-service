/**
 * Benchmark comparing getTokenValue with redundant double lookup vs single cached lookup
 */

const { performance } = require('perf_hooks');

const sampleTokens = Object.create(null);
for (let i = 0; i < 50; i++) {
    sampleTokens[`Token_${i}`] = i * 10;
}

function originalGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    return sampleTokens[name] !== undefined ? sampleTokens[name] : null;
}

function optimizedGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    const val = sampleTokens[name];
    return val !== undefined ? val : null;
}

const testKeys = ['Token_0', 'Token_15', 'Token_49', 'NonExistent', null, 12345];
const iterations = 10000000;

console.log(`--- Benchmarking getTokenValue (${iterations.toLocaleString()} iterations x ${testKeys.length} lookups) ---`);

// Warmup
for (let i = 0; i < 50000; i++) {
    const key = testKeys[i % testKeys.length];
    originalGetTokenValue(key);
    optimizedGetTokenValue(key);
}

const startOriginal = performance.now();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        originalGetTokenValue(testKeys[j]);
    }
}
const endOriginal = performance.now();
const timeOriginal = endOriginal - startOriginal;

const startOptimized = performance.now();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        optimizedGetTokenValue(testKeys[j]);
    }
}
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;

const speedup = ((timeOriginal - timeOptimized) / timeOriginal) * 100;

console.log(`Original (double lookup):  ${timeOriginal.toFixed(2)}ms`);
console.log(`Optimized (cached lookup): ${timeOptimized.toFixed(2)}ms`);
console.log(`Performance Improvement:   ${speedup.toFixed(2)}% faster\n`);

module.exports = {
    originalGetTokenValue,
    optimizedGetTokenValue
};
