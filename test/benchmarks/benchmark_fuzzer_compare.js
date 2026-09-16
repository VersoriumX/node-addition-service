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

function regexLeet(baseString) {
    return baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function loopLeet(baseString) {
    let leet = '';
    const len = baseString.length;
    for (let i = 0; i < len; i++) {
        const ch = baseString[i];
        switch (ch) {
            case 'e': case 'E': leet += '3'; break;
            case 'a': case 'A': leet += '4'; break;
            case 's': case 'S': leet += '5'; break;
            case 'o': case 'O': leet += '0'; break;
            default: leet += ch; break;
        }
    }
    return leet;
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

const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    regexLeet(testStr);
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`Single Regex Pass:        ${regexTime.toFixed(4)}ms`);

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    loopLeet(testStr);
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Single Pass Loop:         ${loopTime.toFixed(4)}ms`);

const speedupOverRegex = ((regexTime - loopTime) / regexTime) * 100;
const speedupOverOriginal = ((originalTime - loopTime) / originalTime) * 100;
console.log(`Performance Gain over Single Regex: ${speedupOverRegex.toFixed(2)}% faster`);
console.log(`Performance Gain over Chained Replace: ${speedupOverOriginal.toFixed(2)}% faster\n`);
