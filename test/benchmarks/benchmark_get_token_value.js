// benchmark_get_token_value.js
// Measures performance of getTokenValue lookups with single local property assignment vs double property access

const { getTokenValue, addToken, deleteToken } = require('../../src/tokenmanager');

// Setup test tokens
addToken('BenchToken1', 100);
addToken('BenchToken2', 200);

const testKeys = ['BenchToken1', 'BenchToken2', 'NonExistentToken', 'BenchToken1'];
const iterations = 5000000;

console.log('--- Benchmarking getTokenValue Property Lookup (5,000,000 iterations x 4 keys) ---');

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValue(key);
    }
}

const start = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testKeys) {
        getTokenValue(key);
    }
}
const end = parseFloat(process.hrtime.bigint()) / 1e6;
const totalTime = end - start;

console.log(`Optimized getTokenValue total time: ${totalTime.toFixed(4)}ms`);
console.log(`Average time per lookup: ${(totalTime / (iterations * testKeys.length) * 1e6).toFixed(2)}ns\n`);

deleteToken('BenchToken1');
deleteToken('BenchToken2');
