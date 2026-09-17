const { performance } = require('perf_hooks');
const crypto = require('crypto');

let tokens = {};
for (let i = 0; i < 100; i++) {
    tokens[`token_${i}`] = i * 10;
}

let tokensArrayCache = null;
let tokensJSONCache = null;
let tokensETagCache = null;

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

function getJSONLazy() {
    if (tokensJSONCache === null) {
        updateCacheEager();
    }
    return tokensJSONCache;
}

const ITERATIONS = 50000;

function runBenchmark() {
    console.log(`--- Benchmarking Eager vs Lazy Token Cache Invalidation (${ITERATIONS} mutations) ---`);

    // 1. Eager Cache Update Benchmark
    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens[`dynamic_token`] = i;
        updateCacheEager();
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // 2. Lazy Cache Invalidation Benchmark (simulate mutation batch then single read)
    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens[`dynamic_token`] = i;
        invalidateCacheLazy();
    }
    getJSONLazy(); // Read once after batch of mutations
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;

    console.log(`Eager updateCache time:     ${eagerTime.toFixed(2)}ms`);
    console.log(`Lazy invalidateCache time:  ${lazyTime.toFixed(2)}ms`);
    console.log(`Speedup for mutations:      ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
