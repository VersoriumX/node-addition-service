// benchmark_get_token_value.js
// Measures performance improvement of storing property lookups in local variables in tokenmanager.js

const { getTokenValue } = require('../../src/tokenmanager');

const tokens = Object.create(null);
tokens['GoldX'] = 1800;
tokens['SilverX'] = 25;
tokens['TestToken'] = 100;

function getTokenValueCurrent(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const keys = ['GoldX', 'SilverX', 'TestToken', 'NonExistentToken1', 'NonExistentToken2'];
const iterations = 5000000;

console.log('--- Benchmarking getTokenValue Single-Lookup Optimization (5,000,000 iterations x 5 keys) ---');

// Warmup
for (let i = 0; i < 50000; i++) {
    for (const key of keys) {
        getTokenValueCurrent(key);
        getTokenValueOptimized(key);
    }
}

const startCurrent = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of keys) {
        getTokenValueCurrent(key);
    }
}
const endCurrent = parseFloat(process.hrtime.bigint()) / 1e6;
const current = endCurrent - startCurrent;
console.log(`Original Double Property Lookup: ${current.toFixed(4)}ms`);

const startOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of keys) {
        getTokenValueOptimized(key);
    }
}
const endOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const opt = endOpt - startOpt;
console.log(`Optimized Single Property Lookup: ${opt.toFixed(4)}ms`);

const speedup = ((current - opt) / current) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
