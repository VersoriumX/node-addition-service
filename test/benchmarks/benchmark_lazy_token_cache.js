const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Benchmark comparing eager cache updating vs lazy cache invalidation on token operations
const tokensEager = {};
let eagerJSON = null;
let eagerETag = null;

function updateCacheEager(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    eagerJSON = JSON.stringify(arr);
    eagerETag = `"${crypto.createHash('md5').update(eagerJSON).digest('hex')}"`;
}

const tokensLazy = {};
let lazyJSON = null;
let lazyETag = null;

function invalidateCacheLazy() {
    lazyJSON = null;
    lazyETag = null;
}

function updateCacheLazy(tokens) {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    lazyJSON = JSON.stringify(arr);
    lazyETag = `"${crypto.createHash('md5').update(lazyJSON).digest('hex')}"`;
}

function getLazyJSON(tokens) {
    if (lazyJSON === null) updateCacheLazy(tokens);
    return lazyJSON;
}

const ITERATIONS = 1000;

function runBenchmark() {
    console.log(`--- Benchmarking Lazy Cache Invalidation vs Eager Cache Updates (${ITERATIONS} token additions) ---`);

    // Benchmark Eager
    const startEager = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokensEager[`token_${i}`] = i;
        updateCacheEager(tokensEager);
    }
    const endEager = performance.now();
    const eagerTime = endEager - startEager;

    // Benchmark Lazy
    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        tokensLazy[`token_${i}`] = i;
        invalidateCacheLazy();
    }
    // Final fetch triggers lazy update once
    getLazyJSON(tokensLazy);
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;
    console.log(`Eager Cache Updates:   ${eagerTime.toFixed(3)}ms`);
    console.log(`Lazy Cache Invalidation:${lazyTime.toFixed(3)}ms`);
    console.log(`Performance Gain:       ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
