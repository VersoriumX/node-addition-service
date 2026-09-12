const crypto = require('crypto');

function runBenchmark() {
    console.log('--- Benchmarking Eager Cache Update vs Lazy Cache Invalidation ---');

    const tokens = {};
    for (let i = 0; i < 500; i++) {
        tokens[`init_token_${i}`] = i * 10;
    }

    let tokensJSONCache = null;
    let tokensETagCache = null;
    let tokensArrayCache = null;

    function updateCacheEager() {
        const keys = Object.keys(tokens);
        const arr = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
            const name = keys[i];
            arr[i] = { name, value: tokens[name] };
        }
        tokensJSONCache = JSON.stringify(arr);
        tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
        tokensArrayCache = null;
    }

    function invalidateCacheLazy() {
        tokensJSONCache = null;
        tokensETagCache = null;
        tokensArrayCache = null;
    }

    const iterations = 1000;

    // Measure Eager Cache Updates
    const startEager = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        tokens[`eager_token_${i}`] = i;
        updateCacheEager();
    }
    const endEager = process.hrtime.bigint();

    // Measure Lazy Cache Invalidations
    const startLazy = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        tokens[`lazy_token_${i}`] = i;
        invalidateCacheLazy();
    }
    const endLazy = process.hrtime.bigint();

    const eagerTimeMs = Number(endEager - startEager) / 1e6;
    const lazyTimeMs = Number(endLazy - startLazy) / 1e6;
    const speedup = ((eagerTimeMs - lazyTimeMs) / eagerTimeMs) * 100;

    console.log(`Eager Cache Update Time (${iterations} mutations): ${eagerTimeMs.toFixed(2)} ms`);
    console.log(`Lazy Cache Invalidation Time (${iterations} mutations): ${lazyTimeMs.toFixed(2)} ms`);
    console.log(`Performance Gain: ${speedup.toFixed(2)}% faster`);
}

if (require.main === module) {
    runBenchmark();
}

module.exports = { runBenchmark };
