const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

const iterations = 100000;

console.log(`Running benchmark over ${iterations} iterations...`);

// Scenario 1: Un-cached GET /api/tokens (as server.js previously did)
console.time('Uncached server.js GET /api/tokens');
for (let i = 0; i < iterations; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const body = JSON.stringify(tokenArray);
}
console.timeEnd('Uncached server.js GET /api/tokens');

// Scenario 2: Optimized GET /api/tokens with pre-serialized JSON & ETag check
console.time('Optimized server.js GET /api/tokens');
const etag = getAllTokensETag();
const json = getAllTokensJSON();
for (let i = 0; i < iterations; i++) {
    // Simulating request with If-None-Match header match (304 Not Modified)
    if (isETagMatch(etag, etag)) {
        // Instant 304 response path
        continue;
    }
}
console.timeEnd('Optimized server.js GET /api/tokens');
