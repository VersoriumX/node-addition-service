const tm = require('../../src/tokenmanager');
const database = require('../../src/database');

// Mock saveTokens so disk I/O doesn't obscure in-memory CPU measurements
database.saveTokens = () => Promise.resolve();

console.log('--- Benchmarking Token Mutations (Add / Update / Delete) ---');

const ITERATIONS = 1000;

const startTime = process.hrtime.bigint();

for (let i = 0; i < ITERATIONS; i++) {
    tm.addToken('bench_token_' + i, i);
}

for (let i = 0; i < ITERATIONS; i++) {
    tm.updateToken('bench_token_' + i, i + 1);
}

for (let i = 0; i < ITERATIONS; i++) {
    tm.deleteToken('bench_token_' + i);
}

const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1e6;

console.log(`Executed ${ITERATIONS * 3} token mutations (1000 add, 1000 update, 1000 delete) in ${durationMs.toFixed(2)} ms.`);
console.log('Average time per mutation:', (durationMs / (ITERATIONS * 3)).toFixed(4), 'ms');
