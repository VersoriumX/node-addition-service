// test/benchmarks/benchmark_server_tokens.js
// Measures performance comparison between unoptimized GET /api/tokens vs pre-serialized JSON & ETag caching.

const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

const iterations = 100000;

function unoptimizedTokensHandler(reqHeader) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    return JSON.stringify(tokenArray);
}

function optimizedTokensHandler(reqHeader) {
    const etag = getAllTokensETag();
    if (isETagMatch(reqHeader, etag)) {
        return { status: 304 };
    }
    return { status: 200, etag, body: getAllTokensJSON() };
}

console.log(`--- Benchmarking GET /api/tokens Optimization (${iterations.toLocaleString()} iterations) ---`);

// 1. Unoptimized vs Optimized (200 OK - No Matching Header)
const startUnopt = performance.now();
for (let i = 0; i < iterations; i++) {
    unoptimizedTokensHandler(null);
}
const endUnopt = performance.now();
const timeUnopt = endUnopt - startUnopt;

const startOpt200 = performance.now();
for (let i = 0; i < iterations; i++) {
    optimizedTokensHandler(null);
}
const endOpt200 = performance.now();
const timeOpt200 = endOpt200 - startOpt200;

// 2. Optimized (304 Not Modified - Matching Header)
const matchingETag = getAllTokensETag();
const startOpt304 = performance.now();
for (let i = 0; i < iterations; i++) {
    optimizedTokensHandler(matchingETag);
}
const endOpt304 = performance.now();
const timeOpt304 = endOpt304 - startOpt304;

console.log(`Unoptimized GET /api/tokens (Array map + JSON.stringify): ${timeUnopt.toFixed(2)}ms`);
console.log(`Optimized GET /api/tokens (Pre-serialized 200 OK):          ${timeOpt200.toFixed(2)}ms`);
console.log(`Optimized GET /api/tokens (Pre-calculated ETag 304 Cache):   ${timeOpt304.toFixed(2)}ms`);

const speedup200 = (((timeUnopt - timeOpt200) / timeUnopt) * 100).toFixed(2);
const speedup304 = (((timeUnopt - timeOpt304) / timeUnopt) * 100).toFixed(2);

console.log(`\nPerformance Gain (200 OK): ${speedup200}% faster`);
console.log(`Performance Gain (304 Not Modified): ${speedup304}% faster`);
