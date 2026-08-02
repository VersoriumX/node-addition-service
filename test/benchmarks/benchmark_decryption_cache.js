const { encrypt, decrypt } = require('../../src/encryption');

async function runBenchmark() {
    console.log('--- Benchmarking Decryption Cache Optimization ---');

    const plaintext = 'This is a secret message to measure decryption performance with caching!';
    const ciphertext = encrypt(plaintext);

    // Warm up and perform first decryption (cache miss)
    const startMiss = process.hrtime.bigint();
    const result1 = decrypt(ciphertext);
    const endMiss = process.hrtime.bigint();
    const missDuration = Number(endMiss - startMiss) / 1000000; // in ms

    console.log(`First Decryption (Cache Miss): ${missDuration.toFixed(4)} ms`);

    // Perform subsequent decryptions (cache hits)
    const iterations = 10000;
    const startHit = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        decrypt(ciphertext);
    }
    const endHit = process.hrtime.bigint();
    const hitDurationTotal = Number(endHit - startHit) / 1000000; // in ms
    const hitDurationAvg = hitDurationTotal / iterations;

    console.log(`Subsequent Decryptions (${iterations} iterations): ${hitDurationTotal.toFixed(4)} ms total (${(hitDurationAvg * 1000).toFixed(4)} microseconds avg per decryption)`);

    const speedup = ((missDuration - hitDurationAvg) / missDuration) * 1000000; // Wait, let's do simple ratio
    const speedupPercent = ((1 - (hitDurationAvg / missDuration)) * 100).toFixed(6);
    console.log(`Estimated Cache Hit Speedup: ${speedupPercent}% faster`);

    if (result1 !== plaintext) {
        throw new Error('Decryption correctness failed!');
    }
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
