const crypto = require('crypto');

// Benchmark script to measure the performance improvement of lazy cache invalidation
// versus eager cache regeneration during token mutations (addToken, updateToken, deleteToken).

let tokens = {};
for (let i = 0; i < 500; i++) {
    tokens['token_' + i] = i;
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

const ITERATIONS = 1000;

console.log(`--- Benchmarking Token Mutations (1,000 operations across 500 tokens) ---`);

// Warmup
for (let i = 0; i < 100; i++) {
    tokens['warmup_' + i] = i;
    updateCacheEager();
    invalidateCacheLazy();
}

// Scenario 1: Eager cache updates
const eagerStart = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    tokens['eager_token_' + i] = i;
    updateCacheEager();
}
const eagerEnd = process.hrtime.bigint();
const eagerTime = Number(eagerEnd - eagerStart) / 1e6;

// Reset token dictionary for second scenario
tokens = {};
for (let i = 0; i < 500; i++) {
    tokens['token_' + i] = i;
}

// Scenario 2: Lazy cache invalidation
const lazyStart = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    tokens['lazy_token_' + i] = i;
    invalidateCacheLazy();
}
const lazyEnd = process.hrtime.bigint();
const lazyTime = Number(lazyEnd - lazyStart) / 1e6;

console.log(`Eager Cache Regeneration: ${eagerTime.toFixed(2)}ms`);
console.log(`Lazy Cache Invalidation:   ${lazyTime.toFixed(2)}ms`);

const speedup = ((eagerTime - lazyTime) / eagerTime) * 100;
console.log(`Speedup:                   ${speedup.toFixed(2)}% faster`);
