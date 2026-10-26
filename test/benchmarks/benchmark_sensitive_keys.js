const SENSITIVE_KEYS_ARR = ['__proto__', 'constructor', 'prototype'];
const SENSITIVE_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

const testNames = ['token_alpha', 'user_token_123', 'constructor', 'token_beta', '__proto__', 'valid_token_name'];
const ITERATIONS = 5000000;

console.log(`--- Benchmarking SENSITIVE_KEYS Lookup Performance (${ITERATIONS} x ${testNames.length} calls) ---`);

console.time('Array.includes (O(N) linear search)');
for (let i = 0; i < ITERATIONS; i++) {
    for (const name of testNames) {
        SENSITIVE_KEYS_ARR.includes(name);
    }
}
console.timeEnd('Array.includes (O(N) linear search)');

console.time('Set.has (O(1) hash table lookup)');
for (let i = 0; i < ITERATIONS; i++) {
    for (const name of testNames) {
        SENSITIVE_KEYS_SET.has(name);
    }
}
console.timeEnd('Set.has (O(1) hash table lookup)');
