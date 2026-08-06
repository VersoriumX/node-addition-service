const { performance } = require('perf_hooks');

const SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];
const SAFE_NAME_REGEX = /^[a-zA-Z0-9\s._-]+$/;

// Mock database saving to avoid disk I/O in the benchmark
const mockSaveTokens = () => Promise.resolve();
const mockUpdateCache = () => {};

// 1. Current addToken implementation
function currentAddToken(name, value, tokens) {
    if (typeof name !== 'string' || name.length > 100 || typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid token name or value');
    }
    // 🛡️ Sentinel: Validate that token name contains only a safe set of characters
    if (!/^[a-zA-Z0-9\s._-]+$/.test(name)) {
        throw new Error('Invalid token name: contains invalid characters / Invalid token name or value');
    }
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    if (!SAFE_NAME_REGEX.test(name)) {
        throw new Error('Invalid token name: contains invalid characters');
    }
    tokens[name] = value;
    mockUpdateCache();
    return mockSaveTokens();
}

// 2. Optimized addToken implementation (removes the redundant regex check)
function optimizedAddToken(name, value, tokens) {
    if (typeof name !== 'string' || name.length > 100 || typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error('Invalid token name or value');
    }
    // 🛡️ Sentinel: Validate that token name contains only a safe set of characters
    if (!SAFE_NAME_REGEX.test(name)) {
        throw new Error('Invalid token name: contains invalid characters / Invalid token name or value');
    }
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    tokens[name] = value;
    mockUpdateCache();
    return mockSaveTokens();
}

const ITERATIONS = 1000000; // 1 million iterations
const testTokens = {};

function runBenchmark() {
    console.log('--- Benchmarking addToken Regex Optimization (1,000,000 iterations) ---');

    // Warm-up
    for (let i = 0; i < 10000; i++) {
        currentAddToken('TokenName', 100, testTokens);
        optimizedAddToken('TokenName', 100, testTokens);
    }

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentAddToken('TokenName', 100, testTokens);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedAddToken('TokenName', 100, testTokens);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
    console.log(`Current (double regex check):   ${currentTime.toFixed(2)}ms`);
    console.log(`Optimized (single regex check):  ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:                        ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
