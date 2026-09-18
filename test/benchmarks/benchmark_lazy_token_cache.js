const { performance } = require('perf_hooks');
const crypto = require('crypto');

let tokens = Object.create(null);
for (let i = 0; i < 1000; i++) {
    tokens[`token_${i}`] = i;
}

let tokensJSONCache = null;
let tokensETagCache = null;

function updateCache() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    tokensJSONCache = JSON.stringify(arr);
    tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
}

function invalidateCache() {
    tokensJSONCache = null;
    tokensETagCache = null;
}

function getAllTokensJSON() {
    if (tokensJSONCache === null) updateCache();
    return tokensJSONCache;
}

const ITERATIONS = 1000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Mutations: Eager updateCache vs Lazy invalidateCache (${ITERATIONS} mutations) ---`);

    // 1. Eager updateCache benchmark
    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens[`eager_token_${i}`] = i;
        updateCache();
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // Reset tokens
    tokens = Object.create(null);
    for (let i = 0; i < 1000; i++) {
        tokens[`token_${i}`] = i;
    }

    // 2. Lazy invalidateCache benchmark
    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokens[`lazy_token_${i}`] = i;
        invalidateCache();
    }
    // Perform 1 read at the end
    getAllTokensJSON();
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;

    console.log(`Eager updateCache time:     ${eagerTime.toFixed(2)} ms`);
    console.log(`Lazy invalidateCache time:  ${lazyTime.toFixed(2)} ms`);
    console.log(`Mutation speedup:           ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
