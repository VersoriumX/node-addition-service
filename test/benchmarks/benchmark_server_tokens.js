/**
 * Benchmark comparing unoptimized token response serialization against
 * optimized pre-serialized JSON and pre-calculated ETags in server.js.
 */
const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

function isETagMatch(reqHeader, etag) {
    if (!reqHeader) return false;
    if (reqHeader === etag) return true;
    const cleanHeader = reqHeader.startsWith('W/') ? reqHeader.slice(2) : reqHeader;
    const cleanETag = etag.startsWith('W/') ? etag.slice(2) : etag;
    if (cleanHeader === cleanETag) return true;
    return cleanHeader.includes(cleanETag);
}

const ITERATIONS = 100000;

console.log(`Running token API route benchmark (${ITERATIONS.toLocaleString()} iterations)...`);

// Warmup
for (let i = 0; i < 1000; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    JSON.stringify(tokenArray);
    getAllTokensJSON();
    getAllTokensETag();
}

// 1. Unoptimized route handler logic
const startUnoptimized = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const json = JSON.stringify(tokenArray);
}
const endUnoptimized = process.hrtime.bigint();
const unoptimizedTimeMs = Number(endUnoptimized - startUnoptimized) / 1e6;

// 2. Optimized route handler logic (cached response)
const startOptimized = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    const json = getAllTokensJSON();
}
const endOptimized = process.hrtime.bigint();
const optimizedTimeMs = Number(endOptimized - startOptimized) / 1e6;

// 3. Optimized route handler logic (304 conditional GET hit)
const currentETag = getAllTokensETag();
const start304 = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    if (isETagMatch(currentETag, etag)) {
        // 304 response
    }
}
const end304 = process.hrtime.bigint();
const time304Ms = Number(end304 - start304) / 1e6;

const speedupPct = (((unoptimizedTimeMs - optimizedTimeMs) / unoptimizedTimeMs) * 100).toFixed(2);
const speedup304Pct = (((unoptimizedTimeMs - time304Ms) / unoptimizedTimeMs) * 100).toFixed(2);

console.log(`\nResults for ${ITERATIONS.toLocaleString()} operations:`);
console.log(`Unoptimized (getAllTokens + Object.keys().map + JSON.stringify): ${unoptimizedTimeMs.toFixed(2)} ms`);
console.log(`Optimized (getAllTokensJSON + getAllTokensETag):                    ${optimizedTimeMs.toFixed(2)} ms (${speedupPct}% faster)`);
console.log(`Optimized 304 Conditional GET Hit:                                    ${time304Ms.toFixed(2)} ms (${speedup304Pct}% faster)`);
