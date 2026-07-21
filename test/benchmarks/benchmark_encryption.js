const path = require('path');

async function runBenchmark() {
    console.log('--- Benchmarking Encryption Startup Optimization ---');

    // Clear require cache for src/encryption.js to measure fresh import
    const encryptionPath = require.resolve('../../src/encryption');
    delete require.cache[encryptionPath];

    const startImport = Date.now();
    const encryptionModule = require(encryptionPath);
    const endImport = Date.now();
    const importDuration = endImport - startImport;

    console.log(`Module import time: ${importDuration}ms`);

    // First encryption call (will trigger lazy key generation if implemented lazily)
    const startCrypto = Date.now();
    const encrypted = encryptionModule.encrypt('Hello World');
    const endCrypto = Date.now();
    const firstCryptoDuration = endCrypto - startCrypto;

    console.log(`First cryptographic call duration: ${firstCryptoDuration}ms`);

    // Subsequent cryptographic call
    const startSubsequent = Date.now();
    const decrypted = encryptionModule.decrypt(encrypted);
    const endSubsequent = Date.now();
    const subsequentCryptoDuration = endSubsequent - startSubsequent;

    console.log(`Subsequent cryptographic call duration: ${subsequentCryptoDuration}ms`);
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
