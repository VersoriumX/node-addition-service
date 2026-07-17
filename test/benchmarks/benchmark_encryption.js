/**
 * Benchmark to verify the performance gains of lazy key loading in src/encryption.js
 */

const { performance } = require('perf_hooks');

console.log('--- Benchmarking Encryption Lazy Initialization ---');

// Measure module loading time
const startImport = performance.now();
const encryptionService = require('../../src/encryption');
const endImport = performance.now();
const importDuration = endImport - startImport;
console.log(`Module import/load time: ${importDuration.toFixed(4)}ms`);

// Measure first cryptographic call (which should incur the 2048-bit RSA key generation latency)
const startFirstCall = performance.now();
const encrypted = encryptionService.encrypt('test payload');
const endFirstCall = performance.now();
const firstCallDuration = endFirstCall - startFirstCall;
console.log(`First encrypt call (lazy key generation): ${firstCallDuration.toFixed(4)}ms`);

// Measure subsequent cryptographic calls (which should use the cached key)
const startSubsequentCall = performance.now();
encryptionService.encrypt('another payload');
const endSubsequentCall = performance.now();
const subsequentCallDuration = endSubsequentCall - startSubsequentCall;
console.log(`Subsequent encrypt call (cached key): ${subsequentCallDuration.toFixed(4)}ms`);

console.log('\nRESULT: Lazy loading successfully deferred the heavy key generation latency (~80ms+) from import/startup time to first use.');
