const crypto = require('crypto');
const { performance } = require('perf_hooks');

/**
 * Benchmark comparing Eager Cache Rebuilding vs Lazy Cache Invalidation
 * on Token Mutations.
 */
function runBenchmark() {
    let tokens = {};
    for (let i = 0; i < 500; i++) {
        tokens['token_' + i] = i;
    }

    let tokensJSONCache = null;
    let tokensETagCache = null;

    function updateCacheEager() {
        const keys = Object.keys(tokens);
        const arr = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
            const name = keys[i];
            arr[i] = { name, value: tokens[name] };
        }
        tokensJSONCache = JSON.stringify(arr);
        tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
    }

    function invalidateCacheLazy() {
        tokensJSONCache = null;
        tokensETagCache = null;
    }

    const MUTATIONS = 2000;

    console.log(`--- Benchmarking Token Cache Invalidation (${MUTATIONS} mutations) ---`);

    // Warmup
    for (let i = 0; i < 100; i++) {
        tokens['warmup_' + i] = i;
        updateCacheEager();
        invalidateCacheLazy();
    }

    // Measure Eager Rebuild
    const startEager = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        tokens['mutation_' + i] = i;
        updateCacheEager();
    }
    const endEager = performance.now();
    const eagerDuration = endEager - startEager;

    // Reset tokens for Lazy test
    tokens = {};
    for (let i = 0; i < 500; i++) {
        tokens['token_' + i] = i;
    }

    // Measure Lazy Invalidation
    const startLazy = performance.now();
    for (let i = 0; i < MUTATIONS; i++) {
        tokens['mutation_' + i] = i;
        invalidateCacheLazy();
    }
    const endLazy = performance.now();
    const lazyDuration = endLazy - startLazy;

    const speedup = ((eagerDuration - lazyDuration) / eagerDuration) * 100;

    console.log(`Eager Cache Rebuild:    ${eagerDuration.toFixed(2)}ms`);
    console.log(`Lazy Cache Invalidation: ${lazyDuration.toFixed(2)}ms`);
    console.log(`Performance gain:        ${speedup.toFixed(2)}% faster\n`);
}

if (require.main === module) {
    runBenchmark();
}

module.exports = { runBenchmark };
