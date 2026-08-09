// benchmark_fuzzer_cache.js
// Measures the performance gain of cached fuzzer variations over raw computations

const { performance } = require('perf_hooks');
const { generateVariations, fuzzerCache } = require('../../src/fuzzer');

function runBenchmark() {
    console.log('--- Benchmarking Fuzzer Caching Performance ---');

    const testStr = 'fuzzing_performance_optimization_with_in_memory_cache_benchmark_payload';

    // Warm-up and clear cache to make sure we're measuring clean state
    fuzzerCache.clear();
    const baseline = generateVariations(testStr);

    // Measure Uncached Computations (by repeatedly clearing cache or using unique strings)
    const iterations = 5000;
    console.log(`\nMeasuring raw calculations of ${iterations} unique fuzzer payloads...`);

    const startUncached = performance.now();
    for (let i = 0; i < iterations; i++) {
        // Clear cache so it always computes fresh variations
        fuzzerCache.clear();
        generateVariations(testStr);
    }
    const endUncached = performance.now();
    const uncachedTime = endUncached - startUncached;
    const avgUncached = uncachedTime / iterations;
    console.log(`Total Uncached: ${uncachedTime.toFixed(4)}ms (Avg: ${avgUncached.toFixed(6)}ms per computation)`);

    // Measure Cached Computations (by repeatedly calling generateVariations on the cached payload)
    fuzzerCache.clear();
    generateVariations(testStr); // Cache it first

    const cachedIterations = 200000;
    console.log(`Measuring cached fuzzer lookups of the same payload for ${cachedIterations} iterations...`);

    const startCached = performance.now();
    for (let i = 0; i < cachedIterations; i++) {
        generateVariations(testStr);
    }
    const endCached = performance.now();
    const cachedTime = endCached - startCached;
    const avgCached = cachedTime / cachedIterations;
    console.log(`Total Cached: ${cachedTime.toFixed(4)}ms (Avg: ${avgCached.toFixed(6)}ms per cache hit)`);

    const speedup = ((avgUncached - avgCached) / avgUncached) * 100;
    const factor = avgUncached / avgCached;
    console.log(`\nEstimated Performance Gain per Lookup: ${speedup.toFixed(4)}% faster (${factor.toFixed(2)}x speedup)`);
    console.log(`Time saved per 100k requests: ${((avgUncached - avgCached) * 100000 / 1000).toFixed(4)} seconds\n`);
}

runBenchmark();
