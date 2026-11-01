// benchmark_token_array_cache.js
// Measures performance improvement from unifying token array and JSON cache generation

const crypto = require('crypto');

const tokens = Object.assign(Object.create(null));
for (let i = 0; i < 50; i++) {
    tokens[`Token_${i}`] = i * 10;
}

// Baseline: updateCache and getAllTokensArray maintain separate mapping loops and allocations
let baselineTokensJSONCache = null;
let baselineTokensETagCache = null;
let baselineTokensArrayCache = null;

function baselineInvalidate() {
    baselineTokensJSONCache = null;
    baselineTokensETagCache = null;
    baselineTokensArrayCache = null;
}

function baselineUpdateCache() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    baselineTokensJSONCache = JSON.stringify(arr);
    baselineTokensETagCache = `"${crypto.createHash('md5').update(baselineTokensJSONCache).digest('hex')}"`;
}

function baselineGetAllTokensArray() {
    if (baselineTokensArrayCache === null) {
        const keys = Object.keys(tokens);
        const arr = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
            const name = keys[i];
            arr[i] = Object.freeze({ name, value: tokens[name] });
        }
        baselineTokensArrayCache = Object.freeze(arr);
    }
    return baselineTokensArrayCache;
}

function baselineGetAllTokensJSON() {
    if (baselineTokensJSONCache === null) baselineUpdateCache();
    return baselineTokensJSONCache;
}

// Optimized: updateCache stores the mapped array in tokensArrayCache directly,
// eliminating duplicate loops and allocations
let optTokensJSONCache = null;
let optTokensETagCache = null;
let optTokensArrayCache = null;

function optInvalidate() {
    optTokensJSONCache = null;
    optTokensETagCache = null;
    optTokensArrayCache = null;
}

function optUpdateCache() {
    const keys = Object.keys(tokens);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokens[name] };
    }
    optTokensArrayCache = arr;
    optTokensJSONCache = JSON.stringify(arr);
    optTokensETagCache = `"${crypto.createHash('md5').update(optTokensJSONCache).digest('hex')}"`;
}

function optGetAllTokensArray() {
    if (optTokensArrayCache === null) optUpdateCache();
    return optTokensArrayCache;
}

function optGetAllTokensJSON() {
    if (optTokensJSONCache === null) optUpdateCache();
    return optTokensJSONCache;
}

const iterations = 100000;

console.log(`--- Benchmarking Token Cache Array Construction (${iterations} iterations) ---`);

// Warmup
for (let i = 0; i < 2000; i++) {
    baselineInvalidate();
    baselineGetAllTokensJSON();
    baselineGetAllTokensArray();

    optInvalidate();
    optGetAllTokensJSON();
    optGetAllTokensArray();
}

const startBaseline = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    baselineInvalidate();
    baselineGetAllTokensJSON();
    baselineGetAllTokensArray();
}
const endBaseline = parseFloat(process.hrtime.bigint()) / 1e6;
const baselineTime = endBaseline - startBaseline;

const startOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    optInvalidate();
    optGetAllTokensJSON();
    optGetAllTokensArray();
}
const endOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const optTime = endOpt - startOpt;

const speedup = ((baselineTime - optTime) / baselineTime) * 100;

console.log(`Baseline (dual loops & allocations): ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized (unified array construction): ${optTime.toFixed(2)}ms`);
console.log(`Performance Gain: ${speedup.toFixed(2)}% faster\n`);
