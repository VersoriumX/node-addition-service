/**
 * Benchmark comparing SENSITIVE_KEYS lookup (Set.has vs Array.includes)
 * and getTokenValue lookup (Single property lookup vs Double property lookup).
 */
const ITERATIONS = 10_000_000;

const arrKeys = ['__proto__', 'constructor', 'prototype'];
const setKeys = new Set(['__proto__', 'constructor', 'prototype']);

const testKeys = ['TestToken', 'ValidToken_123', 'prototype', 'missing_key'];

console.log(`--- Benchmarking SENSITIVE_KEYS Lookup (${ITERATIONS.toLocaleString()} iterations) ---`);

const startArr = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const key = testKeys[i % testKeys.length];
    arrKeys.includes(key);
}
const endArr = performance.now();
const timeArr = endArr - startArr;

const startSet = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const key = testKeys[i % testKeys.length];
    setKeys.has(key);
}
const endSet = performance.now();
const timeSet = endSet - startSet;

const speedupKeys = ((timeArr - timeSet) / timeArr * 100).toFixed(2);

console.log(`Array.includes(): ${timeArr.toFixed(2)}ms`);
console.log(`Set.has():        ${timeSet.toFixed(2)}ms`);
console.log(`Speedup:          ${speedupKeys}% faster`);

console.log(`\n--- Benchmarking getTokenValue Single vs Double Property Lookup (${ITERATIONS.toLocaleString()} iterations) ---`);

const tokens = Object.assign(Object.create(null), { 'TestToken': 100, 'ValidToken_123': 200 });

const startDouble = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const key = testKeys[i % testKeys.length];
    const val = tokens[key] !== undefined ? tokens[key] : null;
}
const endDouble = performance.now();
const timeDouble = endDouble - startDouble;

const startSingle = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const key = testKeys[i % testKeys.length];
    const rawVal = tokens[key];
    const val = rawVal !== undefined ? rawVal : null;
}
const endSingle = performance.now();
const timeSingle = endSingle - startSingle;

const speedupTokenValue = ((timeDouble - timeSingle) / timeDouble * 100).toFixed(2);

console.log(`Double Lookup: ${timeDouble.toFixed(2)}ms`);
console.log(`Single Lookup: ${timeSingle.toFixed(2)}ms`);
console.log(`Speedup:       ${speedupTokenValue}% faster`);
