const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Mock token database and cache simulation
let tokens = {};
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
}

function invalidateCacheLazy() {
    tokensJSONCache = null;
    tokensETagCache = null;
}

function updateCacheLazy() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    tokensJSONCache = JSON.stringify(arr);
    tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
}

function getAllTokensJSONLazy() {
    if (tokensJSONCache === null) updateCacheLazy();
    return tokensJSONCache;
}

const MUTATIONS = 2000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Mutations: Eager Cache Update vs Lazy Invalidation (${MUTATIONS} operations) ---`);

    // Warm up
    tokens = {};
    for (let i = 0; i < 100; i++) {
        tokens[`warmup_${i}`] = i;
        updateCacheEager();
    }

    // Benchmark 1: Eager Update on Mutation
    tokens = {};
    const startEager = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        tokens[`token_${i}`] = i;
        updateCacheEager();
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // Benchmark 2: Lazy Cache Invalidation on Mutation
    tokens = {};
    const startLazy = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        tokens[`token_${i}`] = i;
        invalidateCacheLazy();
    }
    getAllTokensJSONLazy(); // Lazily regenerate cache on read
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;

    console.log(`Eager Cache Update:     ${eagerTime.toFixed(2)}ms`);
    console.log(`Lazy Cache Invalidation: ${lazyTime.toFixed(2)}ms`);
    console.log(`Speedup:                ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
