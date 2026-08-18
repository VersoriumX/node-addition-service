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

function originalReverse(str) {
    return str.split('').reverse().join('');
}

function optimizedReverse(str) {
    let rev = '';
    for (let i = str.length - 1; i >= 0; i--) {
        rev += str[i];
    }
    return rev;
}

const startReverseOrig = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    originalReverse(testStr);
}
const endReverseOrig = parseFloat(process.hrtime.bigint()) / 1e6;
const origReverseTime = endReverseOrig - startReverseOrig;
console.log(`Original split('').reverse().join(''): ${origReverseTime.toFixed(4)}ms`);

const startReverseOpt = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    optimizedReverse(testStr);
}
const endReverseOpt = parseFloat(process.hrtime.bigint()) / 1e6;
const optReverseTime = endReverseOpt - startReverseOpt;
console.log(`Optimized backward loop: ${optReverseTime.toFixed(4)}ms`);

const reverseSpeedup = ((origReverseTime - optReverseTime) / origReverseTime) * 100;
console.log(`Estimated Performance Gain: ${reverseSpeedup.toFixed(2)}% faster\n`);
