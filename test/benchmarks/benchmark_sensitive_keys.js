/**
 * Benchmark comparing SENSITIVE_KEYS lookup via Array.prototype.includes vs Set.prototype.has
 */

const ARRAY_KEYS = ['__proto__', 'constructor', 'prototype'];
const SET_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const iterations = 5000000;
const testNames = ['Bitcoin', 'Ethereum', '__proto__', 'Solana', 'constructor'];

console.log(`--- Benchmarking Sensitive Key Lookups (${iterations.toLocaleString()} iterations x ${testNames.length} keys) ---`);

// 1. Array.includes()
console.time('Array.includes()');
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testNames.length; j++) {
        const isSensitive = ARRAY_KEYS.includes(testNames[j]);
    }
}
console.timeEnd('Array.includes()');

// 2. Set.has()
console.time('Set.has()');
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < testNames.length; j++) {
        const isSensitive = SET_KEYS.has(testNames[j]);
    }
}
console.timeEnd('Set.has()');
