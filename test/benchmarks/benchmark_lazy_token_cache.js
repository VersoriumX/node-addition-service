const { performance } = require('perf_hooks');
const crypto = require('crypto');

/**
 * Benchmark script comparing eager cache rebuilding vs. lazy cache invalidation
 * during token mutation operations (addToken, updateToken, deleteToken).
 */

let tokens = {};
for (let i = 0; i < 500; i++) {
    tokens['Token_' + i] = i * 10;
}

let tokensJSONCache = null;
let tokensETagCache = null;
let tokensArrayCache = null;

function updateCacheEager() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    tokensJSONCache = JSON.stringify(arr);
    tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
    tokensArrayCache = null;
}

function invalidateCacheLazy() {
    tokensJSONCache = null;
    tokensETagCache = null;
    tokensArrayCache = null;
}

function runBenchmark() {
    const ITERATIONS = 10000;
    console.log(`--- Benchmarking Token Mutations: Eager vs Lazy Cache Invalidation (${ITERATIONS} iterations) ---`);

    // 1. Eager Cache Rebuild Benchmark
    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens['Token_Mutated_' + i] = i;
        updateCacheEager();
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // Reset tokens state
    tokens = {};
    for (let i = 0; i < 500; i++) {
        tokens['Token_' + i] = i * 10;
    }

    // 2. Lazy Cache Invalidation Benchmark
    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens['Token_Mutated_' + i] = i;
        invalidateCacheLazy();
    }
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;

    console.log(`Eager Cache Rebuilding:   ${eagerTime.toFixed(2)} ms`);
    console.log(`Lazy Cache Invalidation:  ${lazyTime.toFixed(2)} ms`);
    console.log(`Performance gain:         ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
