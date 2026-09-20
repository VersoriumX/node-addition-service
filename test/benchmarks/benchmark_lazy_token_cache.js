const { performance } = require('perf_hooks');
const crypto = require('crypto');

/**
 * Benchmark comparing eager cache updates vs lazy cache invalidation
 * during token mutations in tokenmanager.js.
 */

const tokensEager = {};
let tokensJSONCacheEager = null;
let tokensETagCacheEager = null;

function updateCacheEager(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    tokensJSONCacheEager = JSON.stringify(arr);
    tokensETagCacheEager = `"${crypto.createHash('md5').update(tokensJSONCacheEager).digest('hex')}"`;
}

function addTokenEager(name, value) {
    tokensEager[name] = value;
    updateCacheEager(tokensEager);
}

const tokensLazy = {};
let tokensJSONCacheLazy = null;
let tokensETagCacheLazy = null;

function invalidateCacheLazy() {
    tokensJSONCacheLazy = null;
    tokensETagCacheLazy = null;
}

function updateCacheLazy(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    tokensJSONCacheLazy = JSON.stringify(arr);
    tokensETagCacheLazy = `"${crypto.createHash('md5').update(tokensJSONCacheLazy).digest('hex')}"`;
}

function addTokenLazy(name, value) {
    tokensLazy[name] = value;
    invalidateCacheLazy();
}

function getAllTokensJSONLazy() {
    if (tokensJSONCacheLazy === null) updateCacheLazy(tokensLazy);
    return tokensJSONCacheLazy;
}

const MUTATIONS = 2000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Mutations (${MUTATIONS} operations) ---`);

    // Warm-up
    for (let i = 0; i < 100; i++) {
        addTokenEager(`warm_${i}`, i);
        addTokenLazy(`warm_${i}`, i);
        getAllTokensJSONLazy();
    }

    // 1. Eager Cache Update Benchmark
    const startEager = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        addTokenEager(`token_${i}`, i);
    }
    const endEager = performance.now();
    const timeEager = endEager - startEager;

    // 2. Lazy Cache Invalidation Benchmark
    const startLazy = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        addTokenLazy(`token_${i}`, i);
    }
    // Fetch cache once at the end
    getAllTokensJSONLazy();
    const endLazy = performance.now();
    const timeLazy = endLazy - startLazy;

    const speedup = ((timeEager - timeLazy) / timeEager) * 100;

    console.log(`Eager cache update:        ${timeEager.toFixed(2)}ms`);
    console.log(`Lazy cache invalidation:    ${timeLazy.toFixed(2)}ms`);
    console.log(`Performance Improvement:    ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
