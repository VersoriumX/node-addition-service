const { loadTokens } = require('./src/database');
const { getAllTokens } = require('./src/tokenmanager');
const { performance } = require('perf_hooks');

const ITERATIONS = 10000;

function benchmark(fn, name) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking Token Retrieval ---');

const diskTime = benchmark(() => loadTokens(), 'Disk-based (loadTokens)');
const memoryTime = benchmark(() => getAllTokens(), 'Memory-cached (getAllTokens)');

const improvement = diskTime > 0 ? ((diskTime - memoryTime) / diskTime * 100).toFixed(2) : '0.00';
console.log(`\nPerformance Gain: ${improvement}% faster`);
