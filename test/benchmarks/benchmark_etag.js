const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;
const data = JSON.stringify(Array(100).fill({ name: "TokenName", value: 123.45 }));

function benchmark(fn, name) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking ETag Calculation vs Cached ---');

// Simulated Express ETag generation (weak ETag is usually just size-mtime, but for dynamic content it's often a hash)
function calculateETag(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

const cachedETag = calculateETag(data);

const calcTime = benchmark(() => calculateETag(data), 'Calculating ETag (MD5 Hash)');
const cachedTime = benchmark(() => { const tag = cachedETag; }, 'Returning Cached ETag');

const improvement = ((calcTime - cachedTime) / calcTime * 100).toFixed(2);
console.log(`\nEstimated Performance Gain for ETag retrieval: ${improvement}% faster`);
console.log(`Time saved per request: ${((calcTime - cachedTime) / ITERATIONS).toFixed(6)}ms`);
