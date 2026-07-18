const { performance } = require('perf_hooks');

console.log('--- Benchmarking Encryption Service (Lazy Key Loading) ---');

// 1. Measure Module Import Speed
// At this stage, requiring the module shouldn't generate the RSA key, making it very fast.
const importStart = performance.now();
const encryptionService = require('../../src/encryption');
const importEnd = performance.now();
const importTime = importEnd - importStart;
console.log(`Module Import Time (should be fast, no key generated yet): ${importTime.toFixed(4)}ms`);

// 2. Measure First Cryptographic Call Latency (triggers key generation)
const firstCallStart = performance.now();
const text = 'Hello Bolt!';
const encrypted = encryptionService.encrypt(text);
const firstCallEnd = performance.now();
const firstCallTime = firstCallEnd - firstCallStart;
console.log(`First Cryptographic Call (triggers 2048-bit key generation): ${firstCallTime.toFixed(4)}ms`);

// 3. Measure Subsequent Cached Cryptographic Call Latency (reuses key)
const subsequentCallStart = performance.now();
const decrypted = encryptionService.decrypt(encrypted);
const subsequentCallEnd = performance.now();
const subsequentCallTime = subsequentCallEnd - subsequentCallStart;
console.log(`Subsequent Cryptographic Call (reuses cached key): ${subsequentCallTime.toFixed(4)}ms`);

// Quick correctness check
if (decrypted !== text) {
    console.error('Error: Decrypted text does not match original!');
    process.exit(1);
} else {
    console.log('Integrity Check: Decrypted text matches original successfully.');
}
