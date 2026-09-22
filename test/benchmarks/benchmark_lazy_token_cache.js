const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Simulate token manager state for benchmarking
const SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];
const SAFE_NAME_REGEX = /^[a-zA-Z0-9\s._-]+$/;

function runBenchmark() {
    console.log('--- Benchmarking Token Mutations: Eager vs Lazy Cache Invalidation ---');

    let tokens = Object.create(null);
    for (let i = 0; i < 500; i++) {
        tokens[`token_${i}`] = i;
    }

    let tokensJSONCache = null;
    let tokensETagCache = null;
    let tokensArrayCache = null;

    function eagerUpdateCache() {
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

    function lazyInvalidateCache() {
        tokensJSONCache = null;
        tokensETagCache = null;
        tokensArrayCache = null;
    }

    const ITERATIONS = 10000;

    // Eager benchmark
    const eagerStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const name = `bench_token_${i % 100}`;
        tokens[name] = i;
        eagerUpdateCache();
    }
    const eagerEnd = performance.now();
    const eagerDuration = eagerEnd - eagerStart;

    // Lazy benchmark
    const lazyStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const name = `bench_token_${i % 100}`;
        tokens[name] = i;
        lazyInvalidateCache();
    }
    const lazyEnd = performance.now();
    const lazyDuration = lazyEnd - lazyStart;

    const speedup = ((eagerDuration - lazyDuration) / eagerDuration) * 100;

    console.log(`Eager cache update (10,000 mutations):    ${eagerDuration.toFixed(2)} ms`);
    console.log(`Lazy cache invalidation (10,000 mutations): ${lazyDuration.toFixed(2)} ms`);
    console.log(`Speedup:                                    ${speedup.toFixed(2)}% faster`);
}

runBenchmark();
