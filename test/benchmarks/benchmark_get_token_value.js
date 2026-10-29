// benchmark_get_token_value.js
// Measures performance gain from eliminating redundant double property lookups in token operations.

const tokensMap = Object.assign(Object.create(null), { foo: 100, bar: 200, baz: 300 });

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokensMap[name] !== undefined ? tokensMap[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokensMap[name];
    return val !== undefined ? val : null;
}

const testKeys = ['foo', 'bar', 'baz', 'nonexistent'];
const iterations = 10000000;

console.log('--- Benchmarking Token Lookup Optimization (10,000,000 iterations x 4 keys) ---');

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const key of testKeys) {
        getTokenValueUnoptimized(key);
        getTokenValueOptimized(key);
    }
}

const startUnopt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testKeys) {
        getTokenValueUnoptimized(key);
    }
}
const endUnopt = parseFloat(process.hrtime.bigint()) / 1e6;
const timeUnopt = endUnopt - startUnopt;
console.log(`Unoptimized (Double Property Lookup): ${timeUnopt.toFixed(4)}ms`);

const startOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testKeys) {
        getTokenValueOptimized(key);
    }
}
const endOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const timeOpt = endOpt - startOpt;
console.log(`Optimized (Single Local Variable Lookup): ${timeOpt.toFixed(4)}ms`);

const speedup = ((timeUnopt - timeOpt) / timeUnopt) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
