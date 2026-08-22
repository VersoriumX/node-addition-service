// benchmark_fuzzer_compare.js
// Compares string reversal (.split('').reverse().join('') vs reverseString helper) and leet conversion

const { generateVariations } = require('../../src/fuzzer');

function originalReverse(str) {
    return str.split('').reverse().join('');
}

function optimizedReverse(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions and security standards are super critical!";
const iterations = 500000;

console.log("--- Benchmarking String Reversal (500,000 iterations) ---");

const startOriginalRev = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    originalReverse(testStr);
}
const endOriginalRev = parseFloat(process.hrtime.bigint()) / 1e6;
const originalRevTime = endOriginalRev - startOriginalRev;
console.log(`Original split('').reverse().join(''): ${originalRevTime.toFixed(4)}ms`);

const startOptimizedRev = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    optimizedReverse(testStr);
}
const endOptimizedRev = parseFloat(process.hrtime.bigint()) / 1e6;
const optimizedRevTime = endOptimizedRev - startOptimizedRev;
console.log(`Optimized reverseString helper loop: ${optimizedRevTime.toFixed(4)}ms`);

const speedupRev = ((originalRevTime - optimizedRevTime) / originalRevTime) * 100;
console.log(`Estimated Reversal Gain: ${speedupRev.toFixed(2)}% faster\n`);

console.log("--- Benchmarking generateVariations Service (200,000 iterations) ---");

const genIterations = 200000;
const startGen = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < genIterations; i++) {
    generateVariations(testStr);
}
const endGen = parseFloat(process.hrtime.bigint()) / 1e6;
const genTime = endGen - startGen;
console.log(`Optimized generateVariations execution time: ${genTime.toFixed(4)}ms\n`);
