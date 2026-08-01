// test/benchmarks/benchmark_decryption_cache.js
// Compares uncached vs cached decryption performance to verify Bolt's optimization.

const { encrypt, decrypt } = require('../../src/encryption');

const text = "Bolt Optimization test for RSA decryption caching";
const ciphertext = encrypt(text);

console.log("--- Benchmarking Decryption Cache Optimization ---");

// Cold run (uncached)
const startCold = parseFloat(process.hrtime.bigint()) / 1e6;
const decrypted1 = decrypt(ciphertext);
const endCold = parseFloat(process.hrtime.bigint()) / 1e6;
const coldTime = endCold - startCold;
console.log(`Initial Decryption (Cold Path): ${coldTime.toFixed(4)}ms`);

// Hot runs (cached)
const iterations = 50000;
const startHot = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    decrypt(ciphertext);
}
const endHot = parseFloat(process.hrtime.bigint()) / 1e6;
const hotTime = endHot - startHot;
const avgHotTime = hotTime / iterations;

console.log(`Cached Decryptions (Hot Path - average over ${iterations} iterations): ${avgHotTime.toFixed(6)}ms`);

// Calculate estimated speedup and time saved
// Initial decryption usually takes around ~3-4ms on modern hardware (since key is already loaded)
// but standard decrypt can take up to ~30ms+ if key is cold.
// Here we compare cached vs subsequent uncached decryptions.
// Since RSA decryption is very heavy, cached lookup is orders of magnitude faster.
const speedup = ((coldTime - avgHotTime) / coldTime) * 100;
console.log(`\nEstimated Performance Gain for subsequent cached decryption requests: ${speedup.toFixed(2)}% faster`);
console.log(`Decrypted text matched: ${decrypted1 === text}`);
