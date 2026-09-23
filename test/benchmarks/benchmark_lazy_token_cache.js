const { performance } = require('perf_hooks');
const { addToken, updateToken, deleteToken, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

function runBenchmark() {
    console.log('--- Benchmarking Token Mutations with Lazy Cache Invalidation ---');

    const ITERATIONS = 5000;
    const startTime = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        const tokenName = `BenchToken_${i}`;
        addToken(tokenName, i * 10);
        updateToken(tokenName, i * 20);
        deleteToken(tokenName);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Executed ${ITERATIONS * 3} token mutations (add, update, delete) in ${duration.toFixed(2)}ms.`);
    console.log(`Average mutation time: ${(duration / (ITERATIONS * 3)).toFixed(4)}ms per mutation.`);

    // Verify lazy cache generation still works
    const json = getAllTokensJSON();
    const etag = getAllTokensETag();
    console.log(`Cache generation verified - JSON length: ${json.length}, ETag: ${etag}\n`);
}

runBenchmark();
