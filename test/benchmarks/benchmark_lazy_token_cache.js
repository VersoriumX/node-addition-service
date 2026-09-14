const { addToken, deleteToken, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const fs = require('fs');
const path = require('path');

const tokensJsonPath = path.join(__dirname, '../../src/tokens.json');
const originalTokensJson = fs.readFileSync(tokensJsonPath, 'utf8');

async function runBenchmark() {
    console.log('--- Benchmarking Token Manager Mutations (Lazy Invalidation vs Eager Update) ---');

    // Pre-fill some tokens
    for (let i = 0; i < 500; i++) {
        await addToken(`bench_token_${i}`, i);
    }

    // Ensure cache is populated
    getAllTokensJSON();
    getAllTokensETag();

    const ITERATIONS = 5000;

    // Benchmark addToken with lazy cache invalidation
    console.time(`addToken (${ITERATIONS} ops)`);
    for (let i = 0; i < ITERATIONS; i++) {
        await addToken(`mut_token_${i}`, i);
    }
    console.timeEnd(`addToken (${ITERATIONS} ops)`);

    // Fetch cache once at the end
    console.time('getAllTokensJSON (cache regeneration)');
    const json = getAllTokensJSON();
    console.timeEnd('getAllTokensJSON (cache regeneration)');

    // Clean up added tokens
    for (let i = 0; i < ITERATIONS; i++) {
        await deleteToken(`mut_token_${i}`);
    }
    for (let i = 0; i < 500; i++) {
        await deleteToken(`bench_token_${i}`);
    }
}

runBenchmark().finally(() => {
    fs.writeFileSync(tokensJsonPath, originalTokensJson);
});
