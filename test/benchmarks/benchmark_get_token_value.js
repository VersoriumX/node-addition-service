// benchmark_get_token_value.js
// Compares token lookup performance: double property lookup vs single local variable property lookup

const { getTokenValue } = require('../../src/tokenmanager');

const dummyTokens = Object.assign(Object.create(null), {
    BTC: 50000,
    ETH: 3000,
    SOL: 150,
    DOGE: 0.1,
    TestToken: 100
});

function getTokenValueDouble(name) {
    if (!name || typeof name !== 'string') return null;
    return dummyTokens[name] !== undefined ? dummyTokens[name] : null;
}

function getTokenValueSingle(name) {
    if (!name || typeof name !== 'string') return null;
    const val = dummyTokens[name];
    return val !== undefined ? val : null;
}

const keys = ['BTC', 'ETH', 'NON_EXISTENT', 'SOL', 'TestToken', 'MISSING'];
const iterations = 10000000;

console.log('--- Benchmarking getTokenValue Property Lookup Optimization (10,000,000 iterations) ---');

// Warmup
for (let i = 0; i < 100000; i++) {
    for (const key of keys) {
        getTokenValueDouble(key);
        getTokenValueSingle(key);
        getTokenValue(key);
    }
}

const startDouble = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of keys) {
        getTokenValueDouble(key);
    }
}
const endDouble = parseFloat(process.hrtime.bigint()) / 1e6;
const doubleTime = endDouble - startDouble;
console.log(`Double Property Lookup: ${doubleTime.toFixed(4)}ms`);

const startSingle = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of keys) {
        getTokenValueSingle(key);
    }
}
const endSingle = parseFloat(process.hrtime.bigint()) / 1e6;
const singleTime = endSingle - startSingle;
console.log(`Optimized Single Property Lookup: ${singleTime.toFixed(4)}ms`);

const speedup = ((doubleTime - singleTime) / doubleTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
