const { getAllTokens } = require('../../src/tokenmanager');
const { getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

console.log('--- Benchmarking server.js /api/tokens Response Generation ---');

const iterations = 1000000;

// Current approach in server.js: Object.keys().map(...) and JSON serialization
console.time('Current (Object.keys + map + JSON.stringify)');
for (let i = 0; i < iterations; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const json = JSON.stringify(tokenArray);
}
console.timeEnd('Current (Object.keys + map + JSON.stringify)');

// Optimized approach: Pre-serialized JSON & ETag check
console.time('Optimized (Pre-serialized JSON & ETag check)');
for (let i = 0; i < iterations; i++) {
    const etag = getAllTokensETag();
    const json = getAllTokensJSON();
}
console.timeEnd('Optimized (Pre-serialized JSON & ETag check)');
