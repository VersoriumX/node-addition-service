const { performance } = require('perf_hooks');
const { encrypt, decrypt } = require('../../src/encryption');

const testText = "Hello Bolt Performance Optimization!";
const encrypted = encrypt(testText);

const ITERATIONS = 1000;

console.log('--- Benchmarking Production Decryption Cache (1,000 iterations) ---');

// Warm-up and generate key if needed
decrypt(encrypted);

// First decryption (will be cached afterwards)
const freshText = "Fresh decrypted message!";
const freshEncrypted = encrypt(freshText);
const startFirst = performance.now();
const firstResult = decrypt(freshEncrypted);
const endFirst = performance.now();
const firstTime = endFirst - startFirst;

const startCached = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    decrypt(freshEncrypted);
}
const endCached = performance.now();
const cachedTime = endCached - startCached;

console.log(`First Decryption (Cache Miss): ${firstTime.toFixed(4)}ms`);
console.log(`Subsequent Decryptions (1,000 Cache Hits): ${cachedTime.toFixed(4)}ms`);

const speedup = (((firstTime * ITERATIONS) - cachedTime) / (firstTime * ITERATIONS)) * 100;
console.log(`Estimated Performance Gain for cached decryption: ${speedup.toFixed(4)}% faster`);
console.log(`Time saved per 1,000 decryptions: ${(firstTime * ITERATIONS - cachedTime).toFixed(4)}ms`);
