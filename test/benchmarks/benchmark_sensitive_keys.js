const { performance } = require('perf_hooks');

const SENSITIVE_KEYS_ARRAY = ['__proto__', 'constructor', 'prototype'];
const SENSITIVE_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

const testNames = ['token1', 'Bitcoin', 'Ethereum', 'USDT', 'solana', 'cardano', '__proto__', 'constructor'];
const N = 5000000;

function runBenchmark() {
    console.log('--- Benchmarking Sensitive Key Check: Array.includes vs Set.has ---');

    // Warmup
    for (let i = 0; i < 10000; i++) {
        SENSITIVE_KEYS_ARRAY.includes(testNames[i % testNames.length]);
        SENSITIVE_KEYS_SET.has(testNames[i % testNames.length]);
    }

    const startArray = performance.now();
    for (let i = 0; i < N; i++) {
        const name = testNames[i % testNames.length];
        SENSITIVE_KEYS_ARRAY.includes(name);
    }
    const endArray = performance.now();

    const startSet = performance.now();
    for (let i = 0; i < N; i++) {
        const name = testNames[i % testNames.length];
        SENSITIVE_KEYS_SET.has(name);
    }
    const endSet = performance.now();

    const arrayTime = endArray - startArray;
    const setTime = endSet - startSet;
    const speedup = ((arrayTime - setTime) / arrayTime) * 100;

    console.log(`Array.includes(): ${arrayTime.toFixed(2)}ms`);
    console.log(`Set.has():        ${setTime.toFixed(2)}ms`);
    console.log(`Speedup:          ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark();
