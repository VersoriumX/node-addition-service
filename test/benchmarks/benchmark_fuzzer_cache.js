// benchmark_fuzzer_cache.js
// Measures the performance gain of in-memory caching for the fuzzer service

const { generateVariations, fuzzerCache } = require('../../src/fuzzer');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000; // 100k iterations
const testInput = "SentinelAndBoltFuzzerOptimizationTestingInputString123";

function runBenchmark() {
    console.log('--- Benchmarking Fuzzer Cache Performance ---');
    console.log(`Running ${ITERATIONS.toLocaleString()} iterations on input length ${testInput.length}...`);

    // 1. Measure Uncached Performance by clearing the cache inside the loop
    const startUncached = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fuzzerCache.clear();
        generateVariations(testInput);
    }
    const endUncached = performance.now();
    const uncachedTime = endUncached - startUncached;
    const avgUncached = uncachedTime / ITERATIONS;

    // 2. Measure Cached Performance (allow cache hits)
    fuzzerCache.clear();
    generateVariations(testInput); // prime cache
    const startCached = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        generateVariations(testInput);
    }
    const endCached = performance.now();
    const cachedTime = endCached - startCached;
    const avgCached = cachedTime / ITERATIONS;

    // Report
    const speedup = ((avgUncached - avgCached) / avgUncached) * 100;
    const factor = avgUncached / avgCached;

    console.log(`Uncached Fuzzer Variation Generation: ${uncachedTime.toFixed(2)}ms (Avg: ${avgUncached.toFixed(5)}ms per run)`);
    console.log(`Cached Fuzzer Variation Generation:   ${cachedTime.toFixed(2)}ms (Avg: ${avgCached.toFixed(5)}ms per run)`);
    console.log(`Speedup:                               ${speedup.toFixed(2)}% faster (${factor.toFixed(1)}x faster)\n`);
}

runBenchmark();
