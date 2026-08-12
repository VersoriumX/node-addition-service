const { performance } = require('perf_hooks');
const { generateVariations, _fuzzerCache } = require('../../src/fuzzer');

const ITERATIONS = 100000; // 100k requests
const testInput = "SentinelSecureAndHighlyOptimizedFuzzerInput";

console.log(`--- Benchmarking Fuzzer Caching Optimization (${ITERATIONS.toLocaleString()} iterations) ---`);

function runBenchmark() {
    // 1. Warm up the function
    for (let i = 0; i < 1000; i++) {
        generateVariations(testInput);
    }

    // 2. Cache-Hit Scenario (Repeated calls on the same cached key)
    const startHit = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        generateVariations(testInput);
    }
    const endHit = performance.now();
    const hitTime = endHit - startHit;

    // 3. Cache-Miss Scenario (We clear the cache on every iteration to force recalculation)
    const startMiss = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        _fuzzerCache.clear();
        generateVariations(testInput);
    }
    const endMiss = performance.now();
    const missTime = endMiss - startMiss;

    const speedup = ((missTime - hitTime) / missTime) * 100;
    console.log(`Cache Misses (No Cache): ${missTime.toFixed(2)}ms`);
    console.log(`Cache Hits (Optimized):  ${hitTime.toFixed(2)}ms`);
    console.log(`Speedup:                ${speedup.toFixed(2)}% faster`);
    console.log(`Time saved per ${ITERATIONS.toLocaleString()} iterations: ${(missTime - hitTime).toFixed(2)}ms`);
}

runBenchmark();
