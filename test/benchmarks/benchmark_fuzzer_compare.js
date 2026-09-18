// benchmark_fuzzer_compare.js
// Compares single regex map lookup with the single-pass switch-case character mapping loop

const { generateVariations } = require('../../src/fuzzer');

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

function loopLeet(str) {
    let res = '';
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        switch (ch) {
            case 'e': case 'E': res += '3'; break;
            case 'a': case 'A': res += '4'; break;
            case 's': case 'S': res += '5'; break;
            case 'o': case 'O': res += '0'; break;
            default: res += ch; break;
        }
    }
    return res;
}

const testStr = "The quick brown fox jumps over the lazy dog. Esoteric expressions and security standards are super critical!";
const iterations = 500000;

console.log("--- Benchmarking Leet Conversion (500,000 iterations) ---");

const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    regexLeet(testStr);
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`RegExp Replace Pass:        ${regexTime.toFixed(4)}ms`);

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    loopLeet(testStr);
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Single-Pass Switch Loop:    ${loopTime.toFixed(4)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
