// benchmark_get_token_value.js
// Benchmarks getTokenValue single property lookup vs double property lookup

const testTokens = ['BenchmarkTokenA', 'BenchmarkTokenB', 'NonExistentToken'];
const iterations = 10000000;
const tokens = Object.assign(Object.create(null), { 'BenchmarkTokenA': 100, 'BenchmarkTokenB': 200 });

function getTokenValueDoubleLookup(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueSingleLookup(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

console.log('--- Benchmarking getTokenValue Property Lookup (10,000,000 iterations x 3 keys) ---');

// Warmup
for (let i = 0; i < 100000; i++) {
    for (const key of testTokens) {
        getTokenValueDoubleLookup(key);
        getTokenValueSingleLookup(key);
    }
}

const startDouble = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testTokens) {
        getTokenValueDoubleLookup(key);
    }
}
const endDouble = parseFloat(process.hrtime.bigint()) / 1e6;
const doubleTime = endDouble - startDouble;

const startSingle = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const key of testTokens) {
        getTokenValueSingleLookup(key);
    }
}
const endSingle = parseFloat(process.hrtime.bigint()) / 1e6;
const singleTime = endSingle - startSingle;

console.log(`Double Property Lookup Execution Time: ${doubleTime.toFixed(2)}ms`);
console.log(`Single Property Lookup Execution Time: ${singleTime.toFixed(2)}ms`);

const speedup = ((doubleTime - singleTime) / doubleTime) * 100;
console.log(`Speedup: ${speedup.toFixed(2)}% faster`);
