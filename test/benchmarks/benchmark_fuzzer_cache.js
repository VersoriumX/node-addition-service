const { performance } = require('perf_hooks');
const { generateVariations, fuzzerCache } = require('../../src/fuzzer');

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function uncachedGenerateVariations(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(baseString.split('').reverse().join(''));

    const leet = baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
    variations.add(leet);

    return Array.from(variations);
}

const ITERATIONS = 100000;
const testInput = "SentinelAndBoltGoFastWithFuzzing";

console.log('--- Benchmarking Fuzzer Variations Caching ---');

// Warm up
for (let i = 0; i < 1000; i++) {
    uncachedGenerateVariations(testInput);
    generateVariations(testInput);
}

// 1. Uncached run
fuzzerCache.clear();
const startUncached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    uncachedGenerateVariations(testInput);
}
const endUncached = performance.now();
const uncachedTime = endUncached - startUncached;

// 2. Cached run (first hit is cached, subsequent hits are O(1) cache lookups)
fuzzerCache.clear();
const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateVariations(testInput);
}
const endCached = performance.now();
const cachedTime = endCached - startCached;

console.log(`Uncached Fuzzer: ${uncachedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Cached Fuzzer:   ${cachedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);

const speedup = ((uncachedTime - cachedTime) / uncachedTime) * 100;
console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
console.log(`Time saved per 100k requests: ${(uncachedTime - cachedTime).toFixed(2)}ms`);
