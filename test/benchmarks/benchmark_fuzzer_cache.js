const { performance } = require('perf_hooks');
const { generateVariations } = require('../../src/fuzzer');

const ITERATIONS = 100000; // 100k iterations

console.log("--- Benchmarking Fuzzer Cache Performance (100,000 iterations) ---");

// Warm up the JIT compiler and populate caches
for (let i = 0; i < 5000; i++) {
    generateVariations("warmup");
    generateVariations(`warmup-${i}`);
}

// 1. Uncached Performance (every request has a unique input, forcing full calculation)
const startUncached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(`uncached-input-string-${i}`);
}
const endUncached = performance.now();
const uncachedTime = endUncached - startUncached;

// 2. Cached Performance (every request uses the same input, hitting the cache)
const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations('static-cached-input-string');
}
const endCached = performance.now();
const cachedTime = endCached - startCached;

const speedup = ((uncachedTime - cachedTime) / uncachedTime) * 100;
console.log(`Uncached (Full Calculation): ${uncachedTime.toFixed(4)}ms`);
console.log(`Cached (O(1) Cache Hit):     ${cachedTime.toFixed(4)}ms`);
console.log(`Speedup:                     ${speedup.toFixed(2)}% faster`);
console.log(`Latency saved:               ${(uncachedTime - cachedTime).toFixed(2)}ms per 100k requests`);
