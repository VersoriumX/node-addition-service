const { performance } = require('perf_hooks');
const { addToken, getAllTokensJSON, updateToken, deleteToken } = require('../../src/tokenmanager');

console.log('--- Benchmarking src/tokenmanager.js Lazy Cache Invalidation ---');

const MUTATIONS = 2000;

const startMutations = performance.now();
for (let i = 0; i < MUTATIONS; i++) {
    addToken(`bench_token_${i}`, i);
}
const endMutations = performance.now();
const mutationTime = endMutations - startMutations;

const startRead = performance.now();
const json = getAllTokensJSON();
const endRead = performance.now();
const readTime = endRead - startRead;

console.log(`Time for ${MUTATIONS} token mutations: ${mutationTime.toFixed(3)}ms`);
console.log(`Time for subsequent GET /api/tokens read (cache generation): ${readTime.toFixed(3)}ms`);
console.log(`Total time (mutations + 1 read): ${(mutationTime + readTime).toFixed(3)}ms`);
console.log(`JSON length: ${json.length} characters`);

// Clean up added benchmark tokens
for (let i = 0; i < MUTATIONS; i++) {
    deleteToken(`bench_token_${i}`);
}
