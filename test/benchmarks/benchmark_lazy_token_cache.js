const crypto = require('crypto');
const { addToken, updateToken, deleteToken, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');

function runBenchmark() {
    console.log('--- Benchmarking Lazy Cache Invalidation in Token Manager ---');

    const iterations = 10000;
    const start = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
        addToken(`bench_tok_${i}`, i);
    }

    const mid = process.hrtime.bigint();

    // Trigger one read to regenerate cache
    getAllTokensJSON();
    getAllTokensETag();

    const end = process.hrtime.bigint();

    const addTimeNs = Number(mid - start);
    const readTimeNs = Number(end - mid);
    const totalTimeNs = Number(end - start);

    console.log(`Added ${iterations} tokens in ${(addTimeNs / 1e6).toFixed(2)}ms`);
    console.log(`Cache regeneration + read in ${(readTimeNs / 1e6).toFixed(2)}ms`);
    console.log(`Total duration: ${(totalTimeNs / 1e6).toFixed(2)}ms`);

    // Clean up
    for (let i = 0; i < iterations; i++) {
        deleteToken(`bench_tok_${i}`);
    }
}

if (require.main === module) {
    runBenchmark();
}

module.exports = { runBenchmark };
