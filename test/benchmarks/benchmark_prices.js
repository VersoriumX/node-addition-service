const { performance } = require('perf_hooks');

const ITERATIONS = 100000;
const mockData = {
    "success": true,
    "timestamp": 1622548800,
    "base": "USD",
    "rates": {
        "XAU": 0.00052,
        "XPT": 0.00085,
        "XAG": 0.035,
        "NICKEL": 0.055,
        "COPPER": 0.22
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

console.log('--- Benchmarking Price API Response Generation ---');

// Original approach: JSON.stringify on every request
const originalTime = benchmark(() => {
    const body = JSON.stringify(mockData);
}, 'Original (JSON.stringify every request)');

// Optimized approach: Serving pre-serialized JSON
const preSerializedJSON = JSON.stringify(mockData);
const optimizedTime = benchmark(() => {
    const body = preSerializedJSON;
}, 'Optimized (Pre-serialized JSON)');

const improvement = ((originalTime - optimizedTime) / originalTime * 100).toFixed(2);
console.log(`\nPerformance Gain: ${improvement}% faster`);
console.log(`Time saved per 100k requests: ${(originalTime - optimizedTime).toFixed(2)}ms`);
