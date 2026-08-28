// test/benchmarks/benchmark_server_tokens.js
const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

const iterations = 100000;

console.log("--- Benchmarking server.js GET /api/tokens Optimization ---");

// Mock request / response for Old behavior in server.js
function runOldServerTokensHandler(reqHeader) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const jsonStr = JSON.stringify(tokenArray);
    return { status: 200, body: jsonStr };
}

// Mock request / response for Optimized behavior in server.js
function runOptimizedServerTokensHandler(reqHeader) {
    const etag = getAllTokensETag();
    if (isETagMatch(reqHeader, etag)) {
        return { status: 304 };
    }
    const jsonStr = getAllTokensJSON();
    return { status: 200, etag, body: jsonStr };
}

// 1. Benchmark 200 OK Response (No Cache Header)
const startOld = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    runOldServerTokensHandler();
}
const endOld = parseFloat(process.hrtime.bigint()) / 1e6;
const oldTime = endOld - startOld;
console.log(`Original server.js handler (200 OK): ${oldTime.toFixed(4)}ms`);

const startOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    runOptimizedServerTokensHandler();
}
const endOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const optTime = endOpt - startOpt;
console.log(`Optimized server.js handler (200 OK cached JSON): ${optTime.toFixed(4)}ms`);

const speedup200 = ((oldTime - optTime) / oldTime) * 100;
console.log(`Performance Gain (200 OK): ${speedup200.toFixed(2)}% faster`);

// 2. Benchmark 304 Not Modified Response (Matching ETag Header)
const currentETag = getAllTokensETag();
const start304 = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    runOptimizedServerTokensHandler(currentETag);
}
const end304 = parseFloat(process.hrtime.bigint()) / 1e6;
const time304 = end304 - start304;
console.log(`Optimized server.js handler (304 Not Modified): ${time304.toFixed(4)}ms`);

const speedup304 = ((oldTime - time304) / oldTime) * 100;
console.log(`Performance Gain (304 Not Modified): ${speedup304.toFixed(2)}% faster`);
