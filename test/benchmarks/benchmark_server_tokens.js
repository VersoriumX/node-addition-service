const { performance } = require('perf_hooks');
const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

const ITERATIONS = 100000;

console.log('--- Benchmarking server.js GET /api/tokens endpoint ---');

// 1. Original unoptimized approach
function originalHandler() {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    return JSON.stringify(tokenArray);
}

// 2. Optimized pre-serialized approach (200 OK)
function optimizedHandler(headers = {}) {
    const etag = getAllTokensETag();
    if (isETagMatch(headers['if-none-match'], etag)) {
        return { status: 304, etag };
    }
    return { status: 200, body: getAllTokensJSON(), etag };
}

// Benchmark Original
const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    originalHandler();
}
const endOriginal = performance.now();
const originalTime = endOriginal - startOriginal;

// Benchmark Optimized (200 OK)
const startOptimized200 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    optimizedHandler({});
}
const endOptimized200 = performance.now();
const optimized200Time = endOptimized200 - startOptimized200;

// Benchmark Optimized (304 Not Modified)
const etag = getAllTokensETag();
const startOptimized304 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    optimizedHandler({ 'if-none-match': etag });
}
const endOptimized304 = performance.now();
const optimized304Time = endOptimized304 - startOptimized304;

console.log(`Original handler: ${originalTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Optimized (200 OK): ${optimized200Time.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Optimized (304 Not Modified): ${optimized304Time.toFixed(4)}ms for ${ITERATIONS} iterations`);

const speedup200 = ((originalTime - optimized200Time) / originalTime * 100).toFixed(2);
const speedup304 = ((originalTime - optimized304Time) / originalTime * 100).toFixed(2);

console.log(`\nPerformance gain (200 OK): ${speedup200}% faster`);
console.log(`Performance gain (304 Not Modified): ${speedup304}% faster`);
