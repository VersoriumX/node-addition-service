/**
 * Benchmark comparing double property lookup vs single cached property lookup in getTokenValue
 */

const tokens = { GoldX: 1800, SilverX: 25, Bitcoin: 50000 };

function getTokenValueDoubleLookup(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getTokenValueSingleLookup(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const names = ['GoldX', 'SilverX', 'Bitcoin', 'MissingToken'];
const ITERATIONS = 20000000;

console.log(`--- Benchmarking getTokenValue (${ITERATIONS.toLocaleString()} iterations x ${names.length} keys) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const n of names) {
        getTokenValueDoubleLookup(n);
        getTokenValueSingleLookup(n);
    }
}

// 1. Double property lookup
const startDouble = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < names.length; j++) {
        getTokenValueDoubleLookup(names[j]);
    }
}
const endDouble = process.hrtime.bigint();
const doubleMs = Number(endDouble - startDouble) / 1e6;

// 2. Single property lookup
const startSingle = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < names.length; j++) {
        getTokenValueSingleLookup(names[j]);
    }
}
const endSingle = process.hrtime.bigint();
const singleMs = Number(endSingle - startSingle) / 1e6;

const speedup = ((doubleMs - singleMs) / doubleMs) * 100;

console.log(`Double Property Lookup: ${doubleMs.toFixed(2)} ms`);
console.log(`Single Property Lookup: ${singleMs.toFixed(2)} ms`);
console.log(`Speedup:                ${speedup.toFixed(2)}% faster\n`);
