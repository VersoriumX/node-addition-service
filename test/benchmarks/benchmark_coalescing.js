const assert = require('assert');
const path = require('path');

// We need to mock node-fetch because src/api.js requires it.
// Since we are in a simple environment, we can use a small trick:
// Replace the module in require.cache or just use a mock object.

let fetchCount = 0;
const mockFetch = async (url) => {
    fetchCount++;
    // Simulate some network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
        ok: true,
        json: async () => ({ price: 100 })
    };
};

// Mock node-fetch in require cache
require.cache[require.resolve('node-fetch')] = {
    exports: mockFetch
};

// Now require api.js
const { fetchMetalPrices } = require('../../src/api');

async function runBenchmark() {
    console.log('--- Benchmarking Request Coalescing ---');
    console.log('Triggering 5 concurrent requests...');

    fetchCount = 0;
    const start = Date.now();

    // Trigger 5 concurrent requests
    const requests = [
        fetchMetalPrices(),
        fetchMetalPrices(),
        fetchMetalPrices(),
        fetchMetalPrices(),
        fetchMetalPrices()
    ];

    const results = await Promise.all(requests);
    const end = Date.now();

    console.log(`Requests completed in ${end - start}ms`);
    console.log(`Actual network calls (fetchCount): ${fetchCount}`);

    if (fetchCount > 1) {
        console.log('RESULT: Thundering Herd detected! Multiple network calls for the same resource.');
    } else {
        console.log('RESULT: Request coalescing is working. Only one network call made.');
    }
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
