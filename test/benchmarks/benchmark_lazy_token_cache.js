const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Initial tokens setup
const tokens = {};
for (let i = 0; i < 1000; i++) {
    tokens[`token_${i}`] = i * 10;
}

// Eager updateCache approach
let eagerJSONCache = null;
let eagerETagCache = null;
let eagerArrayCache = null;

function eagerUpdateCache() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    eagerJSONCache = JSON.stringify(arr);
    eagerETagCache = `"${crypto.createHash('md5').update(eagerJSONCache).digest('hex')}"`;
    eagerArrayCache = null;
}

function eagerAddToken(name, value) {
    tokens[name] = value;
    eagerUpdateCache();
}

// Lazy invalidateCache approach
let lazyJSONCache = null;
let lazyETagCache = null;
let lazyArrayCache = null;

function lazyUpdateCache() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    lazyJSONCache = JSON.stringify(arr);
    lazyETagCache = `"${crypto.createHash('md5').update(lazyJSONCache).digest('hex')}"`;
    lazyArrayCache = null;
}

function lazyInvalidateCache() {
    lazyJSONCache = null;
    lazyETagCache = null;
    lazyArrayCache = null;
}

function lazyAddToken(name, value) {
    tokens[name] = value;
    lazyInvalidateCache();
}

function lazyGetAllTokensJSON() {
    if (lazyJSONCache === null) lazyUpdateCache();
    return lazyJSONCache;
}

const ITERATIONS = 10000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Mutations: Eager vs Lazy Cache Invalidation (${ITERATIONS} mutations) ---`);

    // Warm up
    for (let i = 0; i < 100; i++) {
        eagerAddToken(`warm_${i}`, i);
        lazyAddToken(`warm_${i}`, i);
    }

    // Benchmark Eager
    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        eagerAddToken(`eager_${i}`, i);
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // Benchmark Lazy
    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        lazyAddToken(`lazy_${i}`, i);
    }
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;
    console.log(`Eager updateCache time:     ${eagerTime.toFixed(2)}ms`);
    console.log(`Lazy invalidateCache time:  ${lazyTime.toFixed(2)}ms`);
    console.log(`Speedup:                    ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
