const path = require('path');

console.log('--- Benchmarking Encryption Service ---');

function testService() {
    const filePath = path.resolve(__dirname, '../../src/encryption.js');

    // Measure Import Time
    const startImport = process.hrtime.bigint();
    delete require.cache[filePath];
    const service = require(filePath);
    const endImport = process.hrtime.bigint();
    const importTime = Number(endImport - startImport) / 1000000;

    // Measure First Encrypt/Decrypt Time (this triggers lazy generation if optimized)
    const startFirstCrypto = process.hrtime.bigint();
    const encrypted = service.encrypt('Hello VersoriumX');
    const decrypted = service.decrypt(encrypted);
    const endFirstCrypto = process.hrtime.bigint();
    const firstCryptoTime = Number(endFirstCrypto - startFirstCrypto) / 1000000;

    // Measure Subsequent Crypto Time (uses cached key)
    const startSubsequentCrypto = process.hrtime.bigint();
    for (let i = 0; i < 100; i++) {
        const enc = service.encrypt('Hello VersoriumX');
        service.decrypt(enc);
    }
    const endSubsequentCrypto = process.hrtime.bigint();
    const subsequentCryptoTime = Number(endSubsequentCrypto - startSubsequentCrypto) / 1000000 / 100;

    return { importTime, firstCryptoTime, subsequentCryptoTime };
}

// Warm up and run benchmark
const results = [];
for (let i = 0; i < 10; i++) {
    results.push(testService());
}

const avgImport = results.reduce((acc, r) => acc + r.importTime, 0) / results.length;
const avgFirstCrypto = results.reduce((acc, r) => acc + r.firstCryptoTime, 0) / results.length;
const avgSubsequent = results.reduce((acc, r) => acc + r.subsequentCryptoTime, 0) / results.length;

console.log(`Average Import Time:         ${avgImport.toFixed(4)} ms`);
console.log(`Average First Crypto Time:   ${avgFirstCrypto.toFixed(4)} ms`);
console.log(`Average Subsequent (cached): ${avgSubsequent.toFixed(4)} ms`);
console.log(`Total Startup + First Call:  ${(avgImport + avgFirstCrypto).toFixed(4)} ms`);
