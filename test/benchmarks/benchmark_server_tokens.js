const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;

console.log('--- Benchmarking GET /api/tokens Serialization & ETag Optimizations ---');

// Original implementation: Object.keys().map() + JSON.stringify()
const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const json = JSON.stringify(tokenArray);
}
const endOriginal = performance.now();
const originalDuration = endOriginal - startOriginal;

// Optimized implementation: pre-calculated pre-serialized JSON & pre-calculated ETag
const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    const json = getAllTokensJSON();
}
const endOptimized = performance.now();
const optimizedDuration = endOptimized - startOptimized;

const gain = ((originalDuration - optimizedDuration) / originalDuration * 100).toFixed(2);

console.log(`Original GET /api/tokens logic: ${originalDuration.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Optimized GET /api/tokens logic: ${optimizedDuration.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`\nEstimated Performance Gain: ${gain}% faster`);
console.log(`Time saved per request: ${((originalDuration - optimizedDuration) / ITERATIONS).toFixed(6)}ms`);
