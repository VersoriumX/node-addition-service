const { generateVariations } = require('../../src/fuzzer');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;
const testStr = "SentinelVulnerabilityProtectionSecureTokenGate";

console.log('--- Benchmarking Fuzzer Cache ---');

// Warm up
generateVariations(testStr);

// Measure uncached: generate variations for unique inputs to bypass cache (by appending loop index)
const startUncached = performance.now();
for (let i = 0; i < 500; i++) {
    generateVariations(testStr + i);
}
const endUncached = performance.now();
const uncachedTime = endUncached - startUncached;
const uncachedAvg = uncachedTime / 500;

console.log(`Uncached variations generation: ${uncachedTime.toFixed(4)}ms for 500 unique inputs (Avg: ${uncachedAvg.toFixed(4)}ms per call)`);

// Measure cached: repeat generation for the same input to hit the cache
const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(testStr);
}
const endCached = performance.now();
const cachedTime = endCached - startCached;
const cachedAvg = cachedTime / ITERATIONS;

console.log(`Cached variations generation: ${cachedTime.toFixed(4)}ms for ${ITERATIONS} iterations (Avg: ${cachedAvg.toFixed(6)}ms per call)`);

const speedup = ((uncachedAvg - cachedAvg) / uncachedAvg) * 100;
console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
console.log(`Time saved per 100,000 cached requests: ${((uncachedAvg - cachedAvg) * 100).toFixed(2)} seconds`);
