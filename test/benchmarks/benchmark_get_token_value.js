/**
 * Benchmark comparing double property lookup vs local variable cached single lookup in getTokenValue.
 */

const { addToken, deleteToken } = require('../../src/tokenmanager');

// Setup mock tokens dictionary similar to src/tokenmanager.js
const tokens = Object.create(null);
tokens['Bitcoin'] = 50000;
tokens['Ethereum'] = 3000;
tokens['Solana'] = 150;
tokens['Cardano'] = 0.5;
tokens['ZeroToken'] = 0;

function getTokenValueOld(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const testKeys = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'ZeroToken', 'MissingToken', ''];
const iterations = 5000000;

console.log(`--- Benchmarking getTokenValue (${iterations.toLocaleString()} iterations x ${testKeys.length} keys) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValueOld(key);
        getTokenValueOptimized(key);
    }
}

// 1. Old Implementation (Double property lookup)
const startOld = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        getTokenValueOld(testKeys[j]);
    }
}
const endOld = process.hrtime.bigint();
const oldDurationMs = Number(endOld - startOld) / 1e6;
console.log(`Old Implementation (Double Lookup): ${oldDurationMs.toFixed(2)}ms`);

// 2. Optimized Implementation (Single property lookup)
const startNew = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testKeys.length; j++) {
        getTokenValueOptimized(testKeys[j]);
    }
}
const endNew = process.hrtime.bigint();
const newDurationMs = Number(endNew - startNew) / 1e6;
console.log(`Optimized Implementation (Single Lookup): ${newDurationMs.toFixed(2)}ms`);

const speedup = ((oldDurationMs - newDurationMs) / oldDurationMs) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
