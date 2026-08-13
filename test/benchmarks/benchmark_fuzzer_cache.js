// benchmark_fuzzer_cache.js
// Measures performance gain from the in-memory cache for repeated calls on the fuzzer service

const { performance } = require('perf_hooks');
const { generateVariations } = require('../../src/fuzzer');

const ITERATIONS = 100000;
const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions!";

console.log('--- Benchmarking Fuzzer Service Cache Performance ---');

// 1. Measure cache miss path by generating unique strings (first-time call per string)
console.log('Running cache misses...');
const startMisses = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Generate variations of a unique string to bypass the cache
    generateVariations(`unique_string_prefix_${i}_suffix`);
}
const endMisses = performance.now();
const cacheMissTime = endMisses - startMisses;

// 2. Measure cache hit path by calling the fuzzer with the exact same string repeatedly
console.log('Running cache hits...');
const startHits = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(testStr);
}
const endHits = performance.now();
const cacheHitTime = endHits - startHits;

console.log(`\nResults for ${ITERATIONS} iterations:`);
console.log(`Cache Misses (Full computations): ${cacheMissTime.toFixed(4)}ms`);
console.log(`Cache Hits (O(1) memory retrieval): ${cacheHitTime.toFixed(4)}ms`);

const speedup = ((cacheMissTime - cacheHitTime) / cacheMissTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
