const tokenManager = require('../../src/tokenmanager');

console.log('Running benchmark for lazy token cache invalidation...');

const iterations = 1000;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
    tokenManager.addToken(`bench_token_${i}`, i);
}

const mutationDuration = Date.now() - startTime;
console.log(`Time taken for ${iterations} token additions: ${mutationDuration} ms`);

const jsonStartTime = Date.now();
const jsonResult = tokenManager.getAllTokensJSON();
const etagResult = tokenManager.getAllTokensETag();
const readDuration = Date.now() - jsonStartTime;

console.log(`Time taken to retrieve pre-serialized JSON & ETag: ${readDuration} ms`);

if (typeof jsonResult === 'string' && jsonResult.length > 0 && typeof etagResult === 'string') {
    console.log('✅ Benchmark completed successfully and validated output format.');
} else {
    console.error('❌ Benchmark failed: Invalid JSON or ETag output.');
    process.exit(1);
}
