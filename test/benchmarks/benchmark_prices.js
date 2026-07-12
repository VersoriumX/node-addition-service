const { performance } = require('perf_hooks');
const crypto = require('crypto');

const ITERATIONS = 100000;
const sampleData = {
    "success": true,
    "timestamp": 1715692080,
    "base": "USD",
    "rates": {
        "XAU": 0.000424,
        "XPT": 0.000951,
        "XAG": 0.034512,
        "NICKEL": 0.052145,
        "COPPER": 0.221451
    }
};

const jsonString = JSON.stringify(sampleData);
const etag = `"${crypto.createHash('md5').update(jsonString).digest('hex')}"`;

function benchmark(fn, name) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking Price API Response Generation ---');

// Standard approach (simulated): JSON.stringify + hashing for ETag (done by Express)
const standardTime = benchmark(() => {
    const body = JSON.stringify(sampleData);
    const hash = crypto.createHash('md5').update(body).digest('hex');
    const fullTag = `"${hash}"`;
}, 'Standard (JSON.stringify + Hashing)');

// Optimized approach: Return pre-serialized JSON and pre-calculated ETag
const optimizedTime = benchmark(() => {
    const body = jsonString;
    const tag = etag;
}, 'Optimized (Pre-serialized + Pre-calculated ETag)');

// 304 Not Modified approach: Only header check
const etag304Time = benchmark(() => {
    const receivedTag = etag;
    const match = receivedTag === etag;
}, '304 Not Modified (Header check only)');

const improvement = ((standardTime - optimizedTime) / standardTime * 100).toFixed(2);
const totalImprovement = ((standardTime - etag304Time) / standardTime * 100).toFixed(2);

console.log(`\nPerformance Gain (Optimized Response): ${improvement}% faster`);
console.log(`Performance Gain (304 Not Modified): ${totalImprovement}% faster`);
console.log(`Time saved per 1M requests: ${((standardTime - etag304Time) / ITERATIONS * 1000000).toFixed(2)}ms`);
