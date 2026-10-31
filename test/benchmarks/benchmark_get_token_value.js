// benchmark_get_token_value.js
// Measures performance of getTokenValue single lookup vs unoptimized double lookup

const { getTokenValue, addToken, deleteToken } = require('../../src/tokenmanager');

// Setup dummy token
addToken('BenchToken', 12345);

const tokensDummy = Object.assign(Object.create(null), { 'BenchToken': 12345 });

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokensDummy[name] !== undefined ? tokensDummy[name] : null;
}

const names = ['BenchToken', 'MissingToken1', 'MissingToken2'];
const iterations = 5000000;

console.log(`--- Benchmarking getTokenValue Property Lookups (${iterations.toLocaleString()} iterations x ${names.length} names) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const name of names) {
        getTokenValueUnoptimized(name);
        getTokenValue(name);
    }
}

// 1. Unoptimized (Double property lookup)
const startDouble = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const name of names) {
        getTokenValueUnoptimized(name);
    }
}
const endDouble = parseFloat(process.hrtime.bigint()) / 1e6;
const doubleTime = endDouble - startDouble;
console.log(`Unoptimized getTokenValue (Double lookup): ${doubleTime.toFixed(4)}ms`);

// 2. Optimized (Single property lookup with local variable)
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
console.log(`Estimated Performance Gain:                 ${lookupSpeedup.toFixed(2)}% faster\n`);

deleteToken('BenchToken');
