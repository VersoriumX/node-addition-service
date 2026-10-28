const { performance } = require('perf_hooks');

const tokens = Object.assign(Object.create(null), {
    'TokenAlpha': 100,
    'TokenBeta': 200,
    'TokenGamma': 300,
    'TokenDelta': 400
});

// Original implementation with double property lookup
function currentGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

// Optimized implementation storing lookup in local variable
function optimizedGetTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

const ITERATIONS = 10000000; // 10 million iterations
const keys = ['TokenAlpha', 'TokenBeta', 'TokenGamma', 'TokenDelta', 'MissingToken'];

function runBenchmark() {
    console.log('--- Benchmarking getTokenValue Property Lookup (10,000,000 iterations x 5 keys) ---');

    // Warm-up
    for (let i = 0; i < 100000; i++) {
        for (const k of keys) {
            currentGetTokenValue(k);
            optimizedGetTokenValue(k);
        }
    }

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (let j = 0; j < keys.length; j++) {
            currentGetTokenValue(keys[j]);
        }
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (let j = 0; j < keys.length; j++) {
            optimizedGetTokenValue(keys[j]);
        }
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
    console.log(`Current (double property lookup):  ${currentTime.toFixed(2)}ms`);
    console.log(`Optimized (single property lookup): ${optimizedTime.toFixed(2)}ms`);
    console.log(`Execution Time Reduction:          ${speedup.toFixed(2)}%\n`);
}

runBenchmark();
