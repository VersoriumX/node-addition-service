// benchmark_fuzzer_cache.js
// Measures the performance of generateVariations with and without fuzzer caching

const { generateVariations } = require('../../src/fuzzer');
const { performance } = require('perf_hooks');

const ITERATIONS = 200000;
const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions and security standards are super critical!";

console.log("--- Benchmarking Fuzzer Variations Generation ---");

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(testStr);
}
const end = performance.now();
const elapsed = end - start;

console.log(`Execution Time: ${elapsed.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Average Time per Call: ${(elapsed / ITERATIONS * 1000).toFixed(4)}µs`);
