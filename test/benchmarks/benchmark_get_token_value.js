// benchmark_get_token_value.js
// Measures performance of getTokenValue single lookup and SENSITIVE_KEYS Set.has() vs double lookup and Array.includes()

const { getTokenValue, addToken, deleteToken } = require('../../src/tokenmanager');

// Setup dummy token
addToken('BenchToken', 12345);

const SENSITIVE_KEYS_ARRAY = ['__proto__', 'constructor', 'prototype'];
const SENSITIVE_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

const tokensDummy = Object.assign(Object.create(null), { 'BenchToken': 12345 });

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokensDummy[name] !== undefined ? tokensDummy[name] : null;
}

const names = ['BenchToken', 'MissingToken1', 'MissingToken2', '__proto__', 'constructor'];
const iterations = 5000000;

console.log("--- Benchmarking Token Lookups & Sensitive Keys Validation (5,000,000 iterations x 5 names) ---");

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const name of names) {
        getTokenValueUnoptimized(name);
        getTokenValue(name);
        SENSITIVE_KEYS_ARRAY.includes(name);
        SENSITIVE_KEYS_SET.has(name);
    }
}

// Benchmark 1: Double property lookup vs Single property lookup
const startDouble = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const name of names) {
        getTokenValueUnoptimized(name);
    }
}
const endDouble = parseFloat(process.hrtime.bigint()) / 1e6;
const doubleTime = endDouble - startDouble;
console.log(`Unoptimized getTokenValue (Double lookup): ${doubleTime.toFixed(4)}ms`);

const startSingle = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const name of names) {
        getTokenValue(name);
    }
}
const endSingle = parseFloat(process.hrtime.bigint()) / 1e6;
const singleTime = endSingle - startSingle;
console.log(`Optimized getTokenValue (Single lookup):   ${singleTime.toFixed(4)}ms`);

const lookupSpeedup = ((doubleTime - singleTime) / doubleTime) * 100;
console.log(`getTokenValue Speedup:                      ${lookupSpeedup.toFixed(2)}% faster\n`);

// Benchmark 2: Array.includes vs Set.has
const startArray = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const name of names) {
        SENSITIVE_KEYS_ARRAY.includes(name);
    }
}
const endArray = parseFloat(process.hrtime.bigint()) / 1e6;
const arrayTime = endArray - startArray;
console.log(`Array.includes sensitive key lookup:        ${arrayTime.toFixed(4)}ms`);

const startSet = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const name of names) {
        SENSITIVE_KEYS_SET.has(name);
    }
}
const endSet = parseFloat(process.hrtime.bigint()) / 1e6;
const setTime = endSet - startSet;
console.log(`Set.has sensitive key lookup:              ${setTime.toFixed(4)}ms`);

const sensitiveSpeedup = ((arrayTime - setTime) / arrayTime) * 100;
console.log(`Sensitive Keys Lookup Speedup:              ${sensitiveSpeedup.toFixed(2)}% faster\n`);

deleteToken('BenchToken');
