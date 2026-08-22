// benchmark_fuzzer_compare.js
// Compares original chained replace performance with the single regex map lookup

const { generateVariations } = require('../../src/fuzzer');

function originalLeet(baseString) {
    return baseString.replace(/e/gi, '3').replace(/a/gi, '4').replace(/s/gi, '5').replace(/o/gi, '0');
}

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function optimizedLeet(baseString) {
    return baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
}

const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions and security standards are super critical!";
const iterations = 500000;

console.log("--- Benchmarking Leet Conversion (500,000 iterations) ---");

const startOriginal = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    originalLeet(testStr);
}
const endOriginal = parseFloat(process.hrtime.bigint()) / 1e6;
const originalTime = endOriginal - startOriginal;
console.log(`Original Chained Replace: ${originalTime.toFixed(4)}ms`);

const startOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    optimizedLeet(testStr);
}
const endOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
const optimizedTime = endOptimized - startOptimized;
console.log(`Optimized Single Regex Pass: ${optimizedTime.toFixed(4)}ms`);

const speedup = ((originalTime - optimizedTime) / originalTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);

console.log("--- Benchmarking String Reversal (500,000 iterations) ---");

function reverseSplit(str) {
    return str.split('').reverse().join('');
}

function reverseLoop(str) {
    let rev = '';
    for (let i = str.length - 1; i >= 0; i--) {
        rev += str[i];
    }
    return rev;
}

const startReverseSplit = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    reverseSplit(testStr);
}
const endReverseSplit = parseFloat(process.hrtime.bigint()) / 1e6;
const reverseSplitTime = endReverseSplit - startReverseSplit;
console.log(`Original split().reverse().join(): ${reverseSplitTime.toFixed(4)}ms`);

const startReverseLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    reverseLoop(testStr);
}
const endReverseLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const reverseLoopTime = endReverseLoop - startReverseLoop;
console.log(`Optimized reverseString loop: ${reverseLoopTime.toFixed(4)}ms`);

const reverseSpeedup = ((reverseSplitTime - reverseLoopTime) / reverseSplitTime) * 100;
console.log(`Estimated String Reversal Performance Gain: ${reverseSpeedup.toFixed(2)}% faster\n`);
