const { getAllTokens, getAllTokensJSON, getAllTokensETag } = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

function benchmarkUnoptimized() {
    const start = process.hrtime.bigint();
    const iterations = 100000;
    for (let i = 0; i < iterations; i++) {
        const tokens = getAllTokens();
        const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
        const json = JSON.stringify(tokenArray);
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
}

function benchmarkOptimized() {
    const start = process.hrtime.bigint();
    const iterations = 100000;
    for (let i = 0; i < iterations; i++) {
        const etag = getAllTokensETag();
        const json = getAllTokensJSON();
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
}

console.log('Running server tokens benchmark (100,000 operations)...');
const unoptimizedTime = benchmarkUnoptimized();
const optimizedTime = benchmarkOptimized();

console.log(`Unoptimized time: ${unoptimizedTime.toFixed(2)} ms`);
console.log(`Optimized time:   ${optimizedTime.toFixed(2)} ms`);
const improvement = ((unoptimizedTime - optimizedTime) / unoptimizedTime) * 100;
console.log(`Performance Improvement: ${improvement.toFixed(2)}%`);
