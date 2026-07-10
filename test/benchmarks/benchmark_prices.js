const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const rawData = {
    "success": true,
    "timestamp": 1720185600,
    "base": "USD",
    "rates": {
        "XAU": 2321.45,
        "XPT": 985.20,
        "XAG": 29.15,
        "NICKEL": 17450.00,
        "COPPER": 9850.00
    }
};

const preSerializedJson = JSON.stringify(rawData);
const preCalculatedEtag = `"${crypto.createHash('md5').update(preSerializedJson).digest('hex')}"`;

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

// Simulation of res.json()
const standardResJson = () => {
    const json = JSON.stringify(rawData);
    const etag = crypto.createHash('md5').update(json).digest('hex');
};

// Simulation of res.send(preSerializedJson) with pre-calculated ETag
const optimizedResSend = () => {
    const json = preSerializedJson;
    const etag = preCalculatedEtag;
};

const standardTime = benchmark(standardResJson, 'Standard res.json() (Stringify + Hash)');
const optimizedTime = benchmark(optimizedResSend, 'Optimized res.send() (Cached JSON + ETag)');

const improvement = ((standardTime - optimizedTime) / standardTime * 100).toFixed(2);
console.log(`\nEstimated Performance Gain for Price API: ${improvement}% faster`);
console.log(`Time saved per request: ${((standardTime - optimizedTime) / ITERATIONS).toFixed(6)}ms`);
