const { generateVariations } = require('../../src/fuzzer');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;
const testStr = "Sentinel Bolt Performance Optimization 2026!";

console.log('--- Benchmarking Fuzzer Variations Caching ---');

// Warm up
generateVariations(testStr);

// Benchmark uncached path (by generating variations for unique strings)
console.log(`Running ${ITERATIONS} uncached fuzzer calls...`);
const startUncached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Unique inputs prevent cache hits, simulating pure uncached performance
    generateVariations(`input_${i}`);
}
const endUncached = performance.now();
const uncachedTime = endUncached - startUncached;
console.log(`Uncached Path: ${uncachedTime.toFixed(4)}ms`);

// Benchmark cached path (by generating variations for the exact same string)
console.log(`Running ${ITERATIONS} cached fuzzer calls...`);
const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(testStr);
}
const endCached = performance.now();
const cachedTime = endCached - startCached;
console.log(`Cached Path: ${cachedTime.toFixed(4)}ms`);

const speedup = ((uncachedTime - cachedTime) / uncachedTime * 100).toFixed(2);
console.log(`\nEstimated Performance Gain: ${speedup}% faster`);
console.log(`Time saved per 100,000 requests: ${(uncachedTime - cachedTime).toFixed(2)}ms`);
