const crypto = require('crypto');
const { performance } = require('perf_hooks');

const mockData = {
    "success": true,
    "timestamp": 1622548800,
    "base": "USD",
    "date": "2021-06-01",
    "rates": {
        "XAU": 0.000526,
        "XPT": 0.000847,
        "XAG": 0.0357,
        "NICKEL": 0.055,
        "COPPER": 0.22
    }
};

const iterations = 100000;

console.log('--- Benchmarking Price API Optimization ---');

// Standard way: res.json(data) which involves stringify and then Express calculates ETag
const startStandard = performance.now();
for (let i = 0; i < iterations; i++) {
    const json = JSON.stringify(mockData);
    // Simplified ETag calculation as Express would do it
    const etag = crypto.createHash('md5').update(json).digest('hex');
}
const endStandard = performance.now();
console.log(`Standard (stringify + hash): ${(endStandard - startStandard).toFixed(4)}ms for ${iterations} iterations`);

// Optimized way: pre-serialized + pre-calculated ETag
const preSerialized = JSON.stringify(mockData);
const preCalculatedETag = crypto.createHash('md5').update(preSerialized).digest('hex');

const startOptimized = performance.now();
for (let i = 0; i < iterations; i++) {
    // In index.js we just access these pre-calculated values
    const json = preSerialized;
    const etag = preCalculatedETag;
}
const endOptimized = performance.now();
console.log(`Optimized (direct access): ${(endOptimized - startOptimized).toFixed(4)}ms for ${iterations} iterations`);

console.log(`\nPerformance Gain: ${((1 - (endOptimized - startOptimized) / (endStandard - startStandard)) * 100).toFixed(2)}% faster`);
