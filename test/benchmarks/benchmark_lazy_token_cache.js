const { performance } = require('perf_hooks');
const { addToken, updateToken, deleteToken, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

// Benchmark measuring mutation performance
console.log('--- Benchmarking Token Mutations with Lazy Cache Invalidation ---');

const start = performance.now();
for (let i = 0; i < 1000; i++) {
    addToken(`benchmark_token_${i}`, i);
}
for (let i = 0; i < 1000; i++) {
    updateToken(`benchmark_token_${i}`, i + 1);
}
for (let i = 0; i < 1000; i++) {
    deleteToken(`benchmark_token_${i}`);
}
const end = performance.now();

console.log(`Time taken for 3,000 token mutations: ${(end - start).toFixed(2)}ms`);
console.log(`Tokens JSON length: ${getAllTokensJSON().length}`);
console.log(`Tokens ETag: ${getAllTokensETag()}`);
