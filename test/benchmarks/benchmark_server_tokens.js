/**
 * Benchmark to verify performance improvement of pre-serialized JSON & pre-calculated ETags in server.js
 */

const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

const ITERATIONS = 100000;

console.log(`Running benchmark with ${ITERATIONS} iterations...\n`);

// 1. Unoptimized approach (dynamic mapping + stringification + no ETag)
console.time('Unoptimized (Object.keys + map + JSON.stringify)');
for (let i = 0; i < ITERATIONS; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const jsonStr = JSON.stringify(tokenArray);
}
console.timeEnd('Unoptimized (Object.keys + map + JSON.stringify)');

// 2. Optimized approach (pre-serialized JSON + pre-calculated ETag)
console.time('Optimized (getAllTokensJSON + getAllTokensETag)');
for (let i = 0; i < ITERATIONS; i++) {
    const etag = getAllTokensETag();
    const jsonStr = getAllTokensJSON();
}
console.timeEnd('Optimized (getAllTokensJSON + getAllTokensETag)');
