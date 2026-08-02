// benchmark_decryption_cache.js
// Measures the performance gain of cached RSA decryption over raw private key decryption

const { encrypt, decrypt } = require('../../src/encryption');

function runBenchmark() {
    console.log('--- Benchmarking RSA Decryption Cache ---');

    const testStr = 'Performance optimization for RSA decryption with cache';
    const encrypted = encrypt(testStr);

    // Warm-up and baseline check
    const checkDecrypted = decrypt(encrypted);
    if (checkDecrypted !== testStr) {
        throw new Error('Decryption mismatch!');
    }

    // Measure Uncached Decryption (we do it on different encrypted values to avoid hitting cache,
    // or we can generate new encrypted strings)
    const iterations = 50;
    const plaintexts = [];
    const ciphertexts = [];
    for (let i = 0; i < iterations; i++) {
        const text = `Uncached RSA decryption test payload variant ${i}`;
        plaintexts.push(text);
        ciphertexts.push(encrypt(text));
    }

    console.log(`Measuring raw decryption of ${iterations} unique ciphertexts...`);
    const startUncached = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        const res = decrypt(ciphertexts[i]);
        if (res !== plaintexts[i]) {
            throw new Error('Verification failed during uncached run');
        }
    }
    const endUncached = parseFloat(process.hrtime.bigint()) / 1e6;
    const uncachedTime = endUncached - startUncached;
    const avgUncached = uncachedTime / iterations;
    console.log(`Total Uncached Decryption: ${uncachedTime.toFixed(4)}ms (Avg: ${avgUncached.toFixed(4)}ms per decryption)`);

    // Measure Cached Decryption (by repeatedly decrypting the same ciphertext)
    const cachedIterations = 10000;
    console.log(`Measuring cached decryption of the same ciphertext for ${cachedIterations} iterations...`);
    const startCached = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < cachedIterations; i++) {
        const res = decrypt(ciphertexts[0]);
        if (res !== plaintexts[0]) {
            throw new Error('Verification failed during cached run');
        }
    }
    const endCached = parseFloat(process.hrtime.bigint()) / 1e6;
    const cachedTime = endCached - startCached;
    const avgCached = cachedTime / cachedIterations;
    console.log(`Total Cached Decryption: ${cachedTime.toFixed(4)}ms (Avg: ${avgCached.toFixed(6)}ms per decryption)`);

    const speedup = ((avgUncached - avgCached) / avgUncached) * 100;
    const factor = avgUncached / avgCached;
    console.log(`\nEstimated Performance Gain per Decryption: ${speedup.toFixed(4)}% faster (${factor.toFixed(2)}x speedup)`);
    console.log(`Time saved per 100k requests: ${((avgUncached - avgCached) * 100000 / 1000).toFixed(2)} seconds\n`);
}

runBenchmark();
