// test/benchmarks/benchmark_server_tokens.js
// Measures response formatting and serialization overhead for GET /api/tokens in server.js vs pre-serialized caching.

const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

const iterations = 500000;

console.log(`--- Benchmarking GET /api/tokens Response Formatting (${iterations.toLocaleString()} iterations) ---`);

// 1. Old approach used in server.js: Object.keys(tokens).map() + res.json(tokenArray)
function runOldApproach() {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    return JSON.stringify(tokenArray);
}

// 2. Optimized approach: return pre-serialized JSON string directly
function runOptimizedApproach() {
    const etag = getAllTokensETag();
    const json = getAllTokensJSON();
    return { etag, json };
}

// Warmup
for (let i = 0; i < 1000; i++) {
    runOldApproach();
    runOptimizedApproach();
}

// Benchmark Old
const startOld = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    runOldApproach();
}
const endOld = parseFloat(process.hrtime.bigint()) / 1e6;
const timeOld = endOld - startOld;

// Benchmark Optimized
const startOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    runOptimizedApproach();
}
const endOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
const timeOptimized = endOptimized - startOptimized;

const speedup = ((timeOld - timeOptimized) / timeOld) * 100;

console.log(`Original Method (Object.keys().map + JSON.stringify): ${timeOld.toFixed(4)}ms`);
console.log(`Optimized Method (Pre-serialized JSON & Pre-calculated ETag): ${timeOptimized.toFixed(4)}ms`);
console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
console.log(`Time saved per 500,000 operations: ${(timeOld - timeOptimized).toFixed(2)}ms`);
