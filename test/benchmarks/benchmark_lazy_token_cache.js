const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Setup mock tokens
let eagerTokens = Object.assign(Object.create(null), { a: 1, b: 2, c: 3, d: 4, e: 5 });
let lazyTokens = Object.assign(Object.create(null), { a: 1, b: 2, c: 3, d: 4, e: 5 });

// Eager cache variables
let eagerJSONCache = null;
let eagerETagCache = null;

function eagerUpdateCache(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    eagerJSONCache = JSON.stringify(arr);
    eagerETagCache = `"${crypto.createHash('md5').update(eagerJSONCache).digest('hex')}"`;
}
eagerUpdateCache(eagerTokens);

function eagerAddToken(name, value, tokens) {
    tokens[name] = value;
    eagerUpdateCache(tokens);
}

// Lazy cache variables
let lazyJSONCache = null;
let lazyETagCache = null;

function lazyUpdateCache(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    lazyJSONCache = JSON.stringify(arr);
    lazyETagCache = `"${crypto.createHash('md5').update(lazyJSONCache).digest('hex')}"`;
}

function lazyInvalidateCache() {
    lazyJSONCache = null;
    lazyETagCache = null;
}

function lazyAddToken(name, value, tokens) {
    tokens[name] = value;
    lazyInvalidateCache();
}

function getLazyTokensJSON(tokens) {
    if (lazyJSONCache === null) lazyUpdateCache(tokens);
    return lazyJSONCache;
}

const MUTATIONS = 10000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Mutations: Eager Cache vs Lazy Invalidation (${MUTATIONS} mutations) ---`);

    // Benchmark 1: 10000 sequential additions
    const eagerStart = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        eagerAddToken(`token_${i}`, i, eagerTokens);
    }
    const eagerEnd = performance.now();
    const eagerTime = eagerEnd - eagerStart;

    const lazyStart = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        lazyAddToken(`token_${i}`, i, lazyTokens);
    }
    // Read JSON once after batch of mutations
    getLazyTokensJSON(lazyTokens);
    const lazyEnd = performance.now();
    const lazyTime = lazyEnd - lazyStart;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;
    console.log(`Eager updateCache() on mutations: ${eagerTime.toFixed(2)}ms`);
    console.log(`Lazy invalidateCache() + deferred update: ${lazyTime.toFixed(2)}ms`);
    console.log(`Speedup: ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
