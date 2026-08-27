const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

console.log('--- Benchmarking GET /api/tokens Handler Performance (100,000 requests) ---');

const ITERATIONS = 100000;

// Benchmark unoptimized: Object.keys + JSON.stringify per request
console.time('Unoptimized (Object.keys + JSON.stringify)');
for (let i = 0; i < ITERATIONS; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const json = JSON.stringify(tokenArray);
}
console.timeEnd('Unoptimized (Object.keys + JSON.stringify)');

// Benchmark optimized: pre-serialized JSON + pre-calculated ETag
console.time('Optimized (pre-serialized JSON + ETag)');
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    const json = getAllTokensJSON();
}
console.timeEnd('Optimized (pre-serialized JSON + ETag)');

// Benchmark conditional GET (304 Not Modified path)
const sampleETag = getAllTokensETag();
console.time('Optimized Conditional GET (304 Hit)');
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    if (isETagMatch(sampleETag, etag)) {
        // Instant 304 response
    }
}
console.timeEnd('Optimized Conditional GET (304 Hit)');
