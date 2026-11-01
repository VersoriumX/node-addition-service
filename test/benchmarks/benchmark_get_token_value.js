const { performance } = require('perf_hooks');

const tokens = Object.assign(Object.create(null), {
    BTC: 65000,
    ETH: 3500,
    SOL: 150,
    USDT: 1
});

// Original implementation: double property lookup
function originalGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

// Optimized implementation: single property lookup
function optimizedGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const testKeys = ['BTC', 'ETH', 'SOL', 'USDT', 'UNKNOWN'];
const ITERATIONS = 10000000; // 10 million iterations

function runBenchmark() {
    console.log(`--- Benchmarking getTokenValue Property Lookup (${ITERATIONS.toLocaleString()} iterations x ${testKeys.length} keys) ---`);

    // Warm-up
    for (let i = 0; i < 50000; i++) {
        for (const key of testKeys) {
            originalGetTokenValue(key);
            optimizedGetTokenValue(key);
        }
    }

    const startOriginal = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (const key of testKeys) {
            originalGetTokenValue(key);
        }
    }
    const endOriginal = performance.now();
    const originalDuration = endOriginal - startOriginal;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (const key of testKeys) {
            optimizedGetTokenValue(key);
        }
    }
    const endOptimized = performance.now();
    const optimizedDuration = endOptimized - startOptimized;

    const speedup = ((originalDuration - optimizedDuration) / originalDuration) * 100;

    console.log(`Original (double property lookup): ${originalDuration.toFixed(2)}ms`);
    console.log(`Optimized (single property lookup): ${optimizedDuration.toFixed(2)}ms`);
    console.log(`Performance Improvement:           ${speedup.toFixed(2)}% faster\n`);
}

if (require.main === module) {
    runBenchmark();
}

module.exports = { runBenchmark };
