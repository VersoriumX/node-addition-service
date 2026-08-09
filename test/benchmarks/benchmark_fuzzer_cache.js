// benchmark_fuzzer_cache.js
// Compares uncached generateVariations vs cached performance

const { generateVariations, fuzzerCache } = require('../../src/fuzzer');

const inputs = [
    "hello",
    "security",
    "performance",
    "fuzzer",
    "bolt_is_lightning_fast_123!"
];

const iterations = 50000;

console.log("--- Benchmarking fuzzer performance over repeated inputs ---");
console.log(`Running ${iterations} iterations per input across ${inputs.length} inputs...`);

// 1. Measure cached execution (with fuzzerCache enabled)
const startCached = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < inputs.length; j++) {
        generateVariations(inputs[j]);
    }
}
const endCached = parseFloat(process.hrtime.bigint()) / 1e6;
const cachedDuration = endCached - startCached;

// 2. Clear cache and measure uncached execution by clearing before every call
fuzzerCache.clear();
const startUncached = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < inputs.length; j++) {
        // Clear cache so it always evaluates fully
        fuzzerCache.clear();
        generateVariations(inputs[j]);
    }
}
const endUncached = parseFloat(process.hrtime.bigint()) / 1e6;
const uncachedDuration = endUncached - startUncached;

console.log(`Uncached total time: ${uncachedDuration.toFixed(4)}ms`);
console.log(`Cached total time:   ${cachedDuration.toFixed(4)}ms`);

const speedup = ((uncachedDuration - cachedDuration) / uncachedDuration) * 100;
const timesFaster = uncachedDuration / cachedDuration;
console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster (${timesFaster.toFixed(1)}x speedup)`);
console.log(`Time saved per 250,000 requests: ${(uncachedDuration - cachedDuration).toFixed(2)}ms`);
