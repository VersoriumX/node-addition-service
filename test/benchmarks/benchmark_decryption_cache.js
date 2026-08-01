const { performance } = require('perf_hooks');
const { encrypt, decrypt } = require('../../src/encryption');

async function runBenchmark() {
    console.log('--- Benchmarking Decryption Cache Optimization ---');

    const ITERATIONS = 300;

    // 1. Benchmark without cache (decrypting a new ciphertext on each iteration)
    // Generating 300 distinct ciphertexts
    const plaintexts = Array.from({ length: ITERATIONS }, (_, i) => `Plaintext message number ${i}`);
    const ciphertexts = plaintexts.map(p => encrypt(p));

    console.log(`Running ${ITERATIONS} decryptions without cache (distinct inputs)...`);
    const startNoCache = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        decrypt(ciphertexts[i]);
    }
    const endNoCache = performance.now();
    const durationNoCache = endNoCache - startNoCache;

    // 2. Benchmark with cache (decrypting the same ciphertext repeatedly)
    const singlePlaintext = 'A single plaintext message for cache testing';
    const singleCiphertext = encrypt(singlePlaintext);

    // Warm up the cache for this ciphertext
    decrypt(singleCiphertext);

    console.log(`Running ${ITERATIONS} decryptions with cache (repeated inputs)...`);
    const startWithCache = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        decrypt(singleCiphertext);
    }
    const endWithCache = performance.now();
    const durationWithCache = endWithCache - startWithCache;

    console.log(`Decryption without Cache (Distinct Inputs): ${durationNoCache.toFixed(4)}ms for ${ITERATIONS} iterations`);
    console.log(`Decryption with Cache (Repeated Inputs):   ${durationWithCache.toFixed(4)}ms for ${ITERATIONS} iterations`);

    const speedup = ((durationNoCache - durationWithCache) / durationNoCache * 100).toFixed(2);
    console.log(`\nEstimated Performance Gain: ${speedup}% faster`);
    console.log(`Time saved per decryption:  ${((durationNoCache - durationWithCache) / ITERATIONS).toFixed(4)}ms`);
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
