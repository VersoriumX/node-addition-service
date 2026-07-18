const path = require('path');

console.log('--- Benchmarking Encryption Lazy-loading Optimization ---');

// We measure the module load time, the first call (which triggers the key generation),
// and subsequent calls to demonstrate that the expensive 2048-bit key generation
// is deferred and then cached.

console.time('Module Import');
const encryption = require('../../src/encryption');
console.timeEnd('Module Import');

console.time('First Cryptographic Call (Key Generation)');
const encrypted = encryption.encrypt('Hello Bolt!');
console.timeEnd('First Cryptographic Call (Key Generation)');

console.time('Subsequent Cryptographic Call (Cached Key)');
const decrypted = encryption.decrypt(encrypted);
console.timeEnd('Subsequent Cryptographic Call (Cached Key)');

console.log('Decrypted text:', decrypted);
