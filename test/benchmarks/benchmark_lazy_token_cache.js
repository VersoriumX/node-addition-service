const { performance } = require('perf_hooks');
const crypto = require('crypto');

let tokens = {};
for (let i = 0; i < 100; i++) {
    tokens['token_' + i] = i * 10;
}

let tokensJSONCache = null;
let tokensETagCache = null;
let tokensArrayCache = null;

function updateCache() {
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

function invalidateCache() {
    tokensJSONCache = null;
    tokensETagCache = null;
    tokensArrayCache = null;
}

const ITERATIONS = 100000;

function getAllTokensJSON() {
    if (tokensJSONCache === null) updateCache();
    return tokensJSONCache;
}

function runBenchmark() {
    console.log(`--- Benchmarking Token Cache Invalidation (${ITERATIONS.toLocaleString()} iterations) ---`);

    // Warm-up
    for (let i = 0; i < 1000; i++) {
        updateCache();
        invalidateCache();
    }

    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens['bench_token'] = i;
        updateCache();
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens['bench_token'] = i;
        invalidateCache();
    }
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;
    console.log(`Eager Cache Update:      ${eagerTime.toFixed(2)} ms`);
    console.log(`Lazy Cache Invalidation:  ${lazyTime.toFixed(2)} ms`);
    console.log(`Speedup:                 ${speedup.toFixed(2)}% faster`);

    // Verify getter functionality
    const json = getAllTokensJSON();
    console.log(`Getter Verification:     Cache regenerated successfully (${json.length} bytes)\n`);
}

runBenchmark();
