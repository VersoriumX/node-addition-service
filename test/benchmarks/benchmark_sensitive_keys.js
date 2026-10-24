const SENSITIVE_KEYS_ARRAY = ['__proto__', 'constructor', 'prototype'];
const SENSITIVE_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

const sampleNames = ['EthereumX', 'Bitcoin', 'Token123', 'constructor', 'MyToken', 'TestToken', 'invalid_key', 'prototype'];
const ITERATIONS = 1_000_000;

console.log(`--- Benchmarking SENSITIVE_KEYS Lookup (${ITERATIONS.toLocaleString()} iterations) ---`);

console.time('Unoptimized (Array.includes)');
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < sampleNames.length; j++) {
        const name = sampleNames[j];
        if (SENSITIVE_KEYS_ARRAY.includes(name)) {
            // sensitive key detected
        }
    }
}
console.timeEnd('Unoptimized (Array.includes)');

console.time('Optimized (Set.has)');
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < sampleNames.length; j++) {
        const name = sampleNames[j];
        if (SENSITIVE_KEYS_SET.has(name)) {
            // sensitive key detected
        }
    }
}
console.timeEnd('Optimized (Set.has)');
