// benchmark_fuzzer_cache.js
// Measures the performance gain of cached fuzzer variations over raw fuzzer operations

const { generateVariations } = require('../../src/fuzzer');

function runBenchmark() {
    console.log('--- Benchmarking Fuzzer Cache ---');

    const testStr = 'Performance optimization for fuzzer with cache';

    // Warm-up and baseline check
    const checkVariations = generateVariations(testStr);
    if (!Array.isArray(checkVariations) || checkVariations.length === 0) {
        throw new Error('Fuzzer return value mismatch!');
    }

    // Measure Uncached Fuzzer generation (different inputs)
    const iterations = 500;
    const inputs = [];
    for (let i = 0; i < iterations; i++) {
        inputs.push(`Uncached fuzzer test payload variant ${i}`);
    }

    console.log(`Measuring raw fuzzer generation of ${iterations} unique inputs...`);
    const startUncached = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        const res = generateVariations(inputs[i]);
        if (res.length === 0) {
            throw new Error('Verification failed during uncached run');
        }
    }
    const endUncached = parseFloat(process.hrtime.bigint()) / 1e6;
    const uncachedTime = endUncached - startUncached;
    const avgUncached = uncachedTime / iterations;
    console.log(`Total Uncached Fuzzer: ${uncachedTime.toFixed(4)}ms (Avg: ${avgUncached.toFixed(4)}ms per call)`);

    // Measure Cached Fuzzer generation (by repeatedly calling the same input)
    const cachedIterations = 100000;
    console.log(`Measuring cached fuzzer generation of the same input for ${cachedIterations} iterations...`);
    const startCached = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < cachedIterations; i++) {
        const res = generateVariations(inputs[0]);
        if (res.length === 0) {
            throw new Error('Verification failed during cached run');
        }
    }
    const endCached = parseFloat(process.hrtime.bigint()) / 1e6;
    const cachedTime = endCached - startCached;
    const avgCached = cachedTime / cachedIterations;
    console.log(`Total Cached Fuzzer: ${cachedTime.toFixed(4)}ms (Avg: ${avgCached.toFixed(6)}ms per call)`);

    const speedup = ((avgUncached - avgCached) / avgUncached) * 100;
    const factor = avgUncached / avgCached;
    console.log(`\nEstimated Performance Gain per Fuzz operation: ${speedup.toFixed(4)}% faster (${factor.toFixed(2)}x speedup)`);
    console.log(`Time saved per 100k requests: ${((avgUncached - avgCached) * 100000 / 1000).toFixed(2)} seconds\n`);
}

runBenchmark();
