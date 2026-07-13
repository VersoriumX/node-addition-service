const { performance } = require('perf_hooks');
const crypto = require('crypto');

const ITERATIONS = 100000;
const sampleData = {
    gold: 1850.50,
    silver: 25.30,
    platinum: 1050.00,
    timestamp: Date.now(),
    status: 'success',
    base: 'USD',
    rates: {
        XAU: 0.00054,
        XAG: 0.039,
        XPT: 0.00095
    }
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

// Simulated standard behavior (JSON.stringify + implicit ETag hashing in Express)
const standardTime = benchmark(() => {
    const json = JSON.stringify(sampleData);
    crypto.createHash('md5').update(json).digest('hex');
}, 'Standard (Serialization + Hashing)');

// Simulated optimized behavior (Directly returning cached strings)
const preSerializedJson = JSON.stringify(sampleData);
const preCalculatedEtag = crypto.createHash('md5').update(preSerializedJson).digest('hex');

const optimizedTime = benchmark(() => {
    // Just returning the references
    const j = preSerializedJson;
    const e = preCalculatedEtag;
}, 'Optimized (Cached JSON + ETag)');

const gain = ((standardTime - optimizedTime) / standardTime * 100).toFixed(2);
console.log(`\nEstimated Performance Gain: ${gain}% faster`);
console.log(`Time saved per 100k requests: ${(standardTime - optimizedTime).toFixed(2)}ms`);
