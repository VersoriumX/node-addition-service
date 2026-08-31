// test/benchmarks/benchmark_server_tokens.js
// Benchmarks the server.js /api/tokens and price caching optimizations

const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { getMetalCache, isMetalCacheValid, fetchMetalPrices } = require('../../src/api');

const N = 500000; // 500,000 iterations

console.log(`--- Benchmarking server.js /api/tokens Optimization (${N.toLocaleString()} iterations) ---`);

// 1. Unoptimized /api/tokens handler logic
const startTokensOld = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < N; i++) {
    const tokens = getAllTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    const jsonStr = JSON.stringify(tokenArray);
}
const endTokensOld = parseFloat(process.hrtime.bigint()) / 1e6;
const tokensOldTime = endTokensOld - startTokensOld;
console.log(`Unoptimized /api/tokens (Object.keys + map + stringify): ${tokensOldTime.toFixed(4)}ms`);

// 2. Optimized /api/tokens handler logic
const startTokensNew = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < N; i++) {
    const etag = getAllTokensETag();
    const jsonStr = getAllTokensJSON();
}
const endTokensNew = parseFloat(process.hrtime.bigint()) / 1e6;
const tokensNewTime = endTokensNew - startTokensNew;
console.log(`Optimized /api/tokens (pre-serialized JSON + ETag): ${tokensNewTime.toFixed(4)}ms`);

const tokensSpeedup = ((tokensOldTime - tokensNewTime) / tokensOldTime) * 100;
console.log(`\nEstimated Performance Gain for /api/tokens: ${tokensSpeedup.toFixed(2)}% faster`);
console.log(`Time saved per ${N.toLocaleString()} requests: ${(tokensOldTime - tokensNewTime).toFixed(2)}ms\n`);

console.log(`--- Benchmarking server.js /api/prices/metals Optimization (${N.toLocaleString()} iterations) ---`);

// Seed metal cache manually
const metalCache = getMetalCache();
metalCache.data = { price: 100 };
metalCache.json = '{"price":100}';
metalCache.etag = '"123456"';
metalCache.timestamp = Date.now();

// 1. Unoptimized price handler logic
(async () => {
    const startPricesOld = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < N; i++) {
        const prices = await fetchMetalPrices();
        const jsonStr = JSON.stringify(prices);
    }
    const endPricesOld = parseFloat(process.hrtime.bigint()) / 1e6;
    const pricesOldTime = endPricesOld - startPricesOld;
    console.log(`Unoptimized /api/prices (Always async await + stringify): ${pricesOldTime.toFixed(4)}ms`);

    // 2. Optimized price handler logic
    const startPricesNew = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < N; i++) {
        if (isMetalCacheValid()) {
            const cache = getMetalCache();
            const etag = cache.etag;
            const jsonStr = cache.json;
        } else {
            await fetchMetalPrices();
        }
    }
    const endPricesNew = parseFloat(process.hrtime.bigint()) / 1e6;
    const pricesNewTime = endPricesNew - startPricesNew;
    console.log(`Optimized /api/prices (Sync cache check + pre-serialized JSON): ${pricesNewTime.toFixed(4)}ms`);

    const pricesSpeedup = ((pricesOldTime - pricesNewTime) / pricesOldTime) * 100;
    console.log(`\nEstimated Performance Gain for /api/prices: ${pricesSpeedup.toFixed(2)}% faster`);
    console.log(`Time saved per ${N.toLocaleString()} requests: ${(pricesOldTime - pricesNewTime).toFixed(2)}ms`);
})();
