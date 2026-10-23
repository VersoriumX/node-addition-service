const { performance } = require('perf_hooks');

// 1. Unoptimized implementations
const ARRAY_SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];

function currentGetTokenValue(name, tokens) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function currentAddToken(name, value, tokens) {
    if (typeof name !== 'string' || name.length > 100 || typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid token name or value');
    }
    if (ARRAY_SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    tokens[name] = value;
}

// 2. Optimized implementations
const SET_SENSITIVE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function optimizedGetTokenValue(name, tokens) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

function optimizedAddToken(name, value, tokens) {
    if (typeof name !== 'string' || name.length > 100 || typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid token name or value');
    }
    if (SET_SENSITIVE_KEYS.has(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    tokens[name] = value;
}

const testTokens = Object.assign(Object.create(null), {
    TokenA: 100,
    TokenB: 200,
    TokenC: 300,
    TokenD: 400
});

const keysToLookup = ['TokenA', 'TokenB', 'TokenC', 'TokenD', 'NonExistentToken'];
const ITERATIONS = 10000000; // 10 million iterations

function runBenchmark() {
    console.log('--- Benchmarking getTokenValue & SENSITIVE_KEYS Optimization (10,000,000 iterations) ---');

    // Warm-up
    for (let i = 0; i < 10000; i++) {
        currentGetTokenValue(keysToLookup[i % keysToLookup.length], testTokens);
        optimizedGetTokenValue(keysToLookup[i % keysToLookup.length], testTokens);
        currentAddToken('WarmupToken', 1, {});
        optimizedAddToken('WarmupToken', 1, {});
    }

    // Benchmark getTokenValue
    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentGetTokenValue(keysToLookup[i % keysToLookup.length], testTokens);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedGetTokenValue(keysToLookup[i % keysToLookup.length], testTokens);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;

    console.log(`Current getTokenValue (double lookup):  ${currentTime.toFixed(2)}ms`);
    console.log(`Optimized getTokenValue (single lookup): ${optimizedTime.toFixed(2)}ms`);
    console.log(`Performance Gain:                         ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
