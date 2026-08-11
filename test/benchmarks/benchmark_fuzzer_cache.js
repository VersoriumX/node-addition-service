const { performance } = require('perf_hooks');
const { generateVariations, fuzzerCache } = require('../../src/fuzzer');

const ITERATIONS = 100000;
const sampleInput = "sentinel-fuzz-input";

console.log('--- Benchmarking Fuzzer Cache ---');

// Measure Uncached: We clear the cache inside the loop to simulate always uncached behavior
fuzzerCache.clear();
const startUncached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Clear cache on each iteration to force uncached generation
    fuzzerCache.clear();
    generateVariations(sampleInput);
}
const endUncached = performance.now();
const uncachedTime = endUncached - startUncached;

// Measure Cached: Warm up the cache once, then retrieve repeatedly
fuzzerCache.clear();
generateVariations(sampleInput); // Warm up
const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(sampleInput);
}
const endCached = performance.now();
const cachedTime = endCached - startCached;

const improvement = ((uncachedTime - cachedTime) / uncachedTime * 100).toFixed(2);
console.log(`Uncached Fuzzer Generation: ${uncachedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Cached Fuzzer Generation:   ${cachedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`\nEstimated Performance Gain for fuzzer cache: ${improvement}% faster`);
console.log(`Time saved per 100k requests: ${(uncachedTime - cachedTime).toFixed(2)}ms`);
