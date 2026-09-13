const crypto = require('crypto');

// Simulated token store
let tokens = {};
for (let i = 0; i < 500; i++) {
    tokens[`token_${i}`] = i * 10;
}

let tokensArrayCache = null;
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
    tokensArrayCache = null;
}

function invalidateCache() {
    tokensJSONCache = null;
    tokensETagCache = null;
    tokensArrayCache = null;
}

function getAllTokensJSON() {
    if (tokensJSONCache === null) updateCache();
    return tokensJSONCache;
}

// 1. Eager caching approach (Current codebase)
const eagerTokens = { ...tokens };
const startEager = process.hrtime.bigint();
for (let i = 0; i < 2000; i++) {
    eagerTokens[`new_token_${i}`] = i;
    // Eager cache rebuild on every mutation
    const keys = Object.keys(eagerTokens);
    const arr = new Array(keys.length);
    for (let j = 0; j < keys.length; j++) {
        const name = keys[j];
        arr[j] = { name, value: eagerTokens[name] };
    }
    const json = JSON.stringify(arr);
    const etag = `"${crypto.createHash('md5').update(json).digest('hex')}"`;
}
const endEager = process.hrtime.bigint();
const eagerDuration = Number(endEager - startEager) / 1e6;

// 2. Lazy cache invalidation approach (Proposed optimization)
const lazyTokens = { ...tokens };
const startLazy = process.hrtime.bigint();
for (let i = 0; i < 2000; i++) {
    lazyTokens[`new_token_${i}`] = i;
    // Lazy invalidation
    invalidateCache();
}
// Read ONCE at the end
getAllTokensJSON();
const endLazy = process.hrtime.bigint();
const lazyDuration = Number(endLazy - startLazy) / 1e6;

console.log(`--- Benchmarking Token Mutation Cache Invalidation (2,000 mutations) ---`);
console.log(`Eager Cache Rebuild:    ${eagerDuration.toFixed(2)} ms`);
console.log(`Lazy Cache Invalidation: ${lazyDuration.toFixed(2)} ms`);
const speedup = ((eagerDuration - lazyDuration) / eagerDuration) * 100;
console.log(`Speedup:                 ${speedup.toFixed(2)}% faster`);
