const { performance } = require('perf_hooks');
const crypto = require('crypto');

const ITERATIONS = 100000;
const sampleData = {
    "XAU": 1800.50,
    "XPT": 1050.25,
    "XAG": 25.10,
    "NICKEL": 18000.00,
    "COPPER": 9000.00,
    "timestamp": Date.now()
};

function benchmark(fn, name) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking Price API Optimization ---');

// Standard approach: res.json() which does serialization + Express ETag generation
function standardApproach() {
    const json = JSON.stringify(sampleData);
    const etag = crypto.createHash('md5').update(json).digest('hex');
    return { json, etag };
}

// Optimized approach: serving pre-serialized JSON and pre-calculated ETag
const cachedJSON = JSON.stringify(sampleData);
const cachedETag = crypto.createHash('md5').update(cachedJSON).digest('hex');

function optimizedApproach() {
    const json = cachedJSON;
    const etag = cachedETag;
    return { json, etag };
}

const standardTime = benchmark(() => standardApproach(), 'Standard (Serialization + Hashing)');
const optimizedTime = benchmark(() => optimizedApproach(), 'Optimized (Direct Access)');

const improvement = ((standardTime - optimizedTime) / standardTime * 100).toFixed(2);
console.log(`\nPerformance Gain: ${improvement}% faster`);
console.log(`Time saved per request: ${((standardTime - optimizedTime) / ITERATIONS).toFixed(6)}ms`);
