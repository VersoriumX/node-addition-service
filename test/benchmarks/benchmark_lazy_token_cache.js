const { addToken, updateToken, deleteToken, getAllTokensJSON } = require('../../src/tokenmanager');

console.log('Running Lazy Cache Invalidation Benchmark...');

const iterations = 1000;
const start = process.hrtime.bigint();

for (let i = 0; i < iterations; i++) {
    const key = `bench_token_${i}`;
    addToken(key, i);
    updateToken(key, i + 1);
    deleteToken(key);
}

const end = process.hrtime.bigint();
const durationMs = Number(end - start) / 1e6;

console.log(`Completed ${iterations} token mutations in ${durationMs.toFixed(2)} ms.`);

// Force cache generation at the end
const json = getAllTokensJSON();
console.log(`Cache generated successfully (JSON length: ${json.length})`);
