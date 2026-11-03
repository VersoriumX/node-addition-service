/**
 * Benchmark comparing double property access vs single property access in getTokenValue
 */

const tokens = Object.create(null);
tokens['Bitcoin'] = 50000;
tokens['Ethereum'] = 3000;
tokens['Solana'] = 150;

function getTokenValueUnoptimized(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueOptimized(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const iterations = 50000000;
const testKeys = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'];

console.log(`--- Benchmarking getTokenValue Lookups (${iterations.toLocaleString()} iterations) ---`);

// Warmup
for (let i = 0; i < 100000; i++) {
    getTokenValueUnoptimized(testKeys[i % testKeys.length]);
    getTokenValueOptimized(testKeys[i % testKeys.length]);
}

// 1. Unoptimized double property access
const startUnopt = process.hrtime.bigint();
let countUnopt = 0;
for (let i = 0; i < iterations; i++) {
    const val = getTokenValueUnoptimized(testKeys[i % testKeys.length]);
    if (val !== null) countUnopt++;
}
const endUnopt = process.hrtime.bigint();
const unoptMs = Number(endUnopt - startUnopt) / 1e6;
console.log(`Unoptimized (double property lookup): ${unoptMs.toFixed(2)}ms`);

// 2. Optimized single property access
const startOpt = process.hrtime.bigint();
let countOpt = 0;
for (let i = 0; i < iterations; i++) {
    const val = getTokenValueOptimized(testKeys[i % testKeys.length]);
    if (val !== null) countOpt++;
}
const endOpt = process.hrtime.bigint();
const optMs = Number(endOpt - startOpt) / 1e6;
console.log(`Optimized (single property lookup):   ${optMs.toFixed(2)}ms`);

const speedup = (((unoptMs - optMs) / unoptMs) * 100).toFixed(2);
console.log(`Speedup: ${speedup}% faster`);
