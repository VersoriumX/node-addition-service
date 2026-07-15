const { generateVariations } = require('../../src/fuzzer');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;
const testStrings = ['admin', 'password', 'VersoriumX', 'The quick brown fox jumps over the lazy dog'];

function runBenchmark() {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (const str of testStrings) {
            generateVariations(str);
        }
    }
    const end = performance.now();
    return end - start;
}

console.log(`--- Benchmarking generateVariations (${ITERATIONS} iterations) ---`);
const timeTaken = runBenchmark();
console.log(`Total time: ${timeTaken.toFixed(2)}ms`);
console.log(`Average time per call: ${(timeTaken / (ITERATIONS * testStrings.length)).toFixed(6)}ms`);
