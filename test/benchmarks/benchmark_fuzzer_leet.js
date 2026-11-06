const { generateVariations } = require('../../src/fuzzer');

// Baseline RegExp implementation with map lookup
const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function leetWithRegex(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function leetWithLoop(str) {
    let res = '';
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        switch (c) {
            case 'e': case 'E': res += '3'; break;
            case 'a': case 'A': res += '4'; break;
            case 's': case 'S': res += '5'; break;
            case 'o': case 'O': res += '0'; break;
            default: res += c; break;
        }
    }
    return res;
}

const inputs = ["test", "admin", "password123", "Special Characters!@#", "SAMPLE", ""];
const iterations = 1000000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${inputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (let j = 0; j < inputs.length; j++) {
        leetWithRegex(inputs[j]);
        leetWithLoop(inputs[j]);
    }
}

const startRegex = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < inputs.length; j++) {
        leetWithRegex(inputs[j]);
    }
}
const endRegex = process.hrtime.bigint();
const regexTimeMs = Number(endRegex - startRegex) / 1e6;

const startLoop = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < inputs.length; j++) {
        leetWithLoop(inputs[j]);
    }
}
const endLoop = process.hrtime.bigint();
const loopTimeMs = Number(endLoop - startLoop) / 1e6;

console.log(`RegExp replace: ${regexTimeMs.toFixed(3)}ms`);
console.log(`toLeet loop:    ${loopTimeMs.toFixed(3)}ms`);
console.log(`Performance Gain: ${(((regexTimeMs - loopTimeMs) / regexTimeMs) * 100).toFixed(2)}% faster\n`);
