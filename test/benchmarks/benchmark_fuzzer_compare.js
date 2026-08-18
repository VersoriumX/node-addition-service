// benchmark_fuzzer_compare.js
// Compares fuzzer performance optimizations (leet conversion & string reversal)

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

const speedupLeet = ((originalTime - optimizedTime) / originalTime) * 100;
console.log(`Estimated Performance Gain: ${speedupLeet.toFixed(2)}% faster\n`);

console.log("--- Benchmarking String Reversal (500,000 iterations) ---");

const startRevArray = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    originalReverse(testStr);
}
const endRevArray = parseFloat(process.hrtime.bigint()) / 1e6;
const arrayRevTime = endRevArray - startRevArray;
console.log(`Original split('').reverse().join(''): ${arrayRevTime.toFixed(4)}ms`);

const startRevLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    optimizedReverse(testStr);
}
const endRevLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopRevTime = endRevLoop - startRevLoop;
console.log(`Optimized backward loop: ${loopRevTime.toFixed(4)}ms`);

const speedupRev = ((arrayRevTime - loopRevTime) / arrayRevTime) * 100;
console.log(`Estimated Performance Gain: ${speedupRev.toFixed(2)}% faster\n`);

console.log("--- Benchmarking Full generateVariations (500,000 iterations) ---");

const startGen = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    generateVariations(testStr);
}
const endGen = parseFloat(process.hrtime.bigint()) / 1e6;
console.log(`generateVariations Total Execution Time: ${(endGen - startGen).toFixed(4)}ms\n`);
