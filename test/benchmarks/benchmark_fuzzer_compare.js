// benchmark_fuzzer_compare.js
// Compares original chained replace performance with regex map lookup and single-pass switch-case loop

const { leetTransform } = require('../../src/fuzzer');

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

function regexMapLeet(baseString) {
    return baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
}

const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions and security standards are super critical!";
const iterations = 500000;

console.log("--- Benchmarking Leet Conversion (500,000 iterations) ---");

// Warmup
for (let i = 0; i < 10000; i++) {
    originalLeet(testStr);
    regexMapLeet(testStr);
    leetTransform(testStr);
}

const startOriginal = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    originalLeet(testStr);
}
const endOriginal = parseFloat(process.hrtime.bigint()) / 1e6;
const originalTime = endOriginal - startOriginal;

const startRegexMap = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    regexMapLeet(testStr);
}
const endRegexMap = parseFloat(process.hrtime.bigint()) / 1e6;
const regexMapTime = endRegexMap - startRegexMap;

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    leetTransform(testStr);
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;

console.log(`Original Chained Replace:            ${originalTime.toFixed(4)}ms`);
console.log(`RegExp Map Lookup Replace:           ${regexMapTime.toFixed(4)}ms`);
console.log(`Optimized Single-Pass Loop Switch:   ${loopTime.toFixed(4)}ms`);

const speedupOverChained = ((originalTime - loopTime) / originalTime) * 100;
const speedupOverRegexMap = ((regexMapTime - loopTime) / regexMapTime) * 100;

console.log(`\nPerformance Gain over Chained Replace:    ${speedupOverChained.toFixed(2)}% faster`);
console.log(`Performance Gain over RegExp Map Replace: ${speedupOverRegexMap.toFixed(2)}% faster\n`);
