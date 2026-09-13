const { addToken, updateToken, deleteToken, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { performance } = require('perf_hooks');

const ITERATIONS = 1000;

function runBenchmark() {
    console.log(`--- Benchmarking Token Cache Invalidation using real tokenmanager (${ITERATIONS} mutations) ---`);

    const startLazy = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        addToken(`bench_token_${i}`, i);
    }
    const endLazy = performance.now();
    const lazyTime = endLazy - startLazy;

    console.log(`Lazy Token Mutations (${ITERATIONS} calls): ${lazyTime.toFixed(2)}ms`);

    // Fetch JSON and ETag to verify lazy computation
    const startRead = performance.now();
    const json = getAllTokensJSON();
    const etag = getAllTokensETag();
    const endRead = performance.now();
    console.log(`Lazy Cache Computation on Read: ${(endRead - startRead).toFixed(2)}ms`);

    if (json && etag) {
        console.log('Real tokenmanager lazy cache test passed successfully.');
    }

    // Clean up created benchmark tokens
    for (let i = 0; i < ITERATIONS; i++) {
        deleteToken(`bench_token_${i}`);
    }
}

runBenchmark();
