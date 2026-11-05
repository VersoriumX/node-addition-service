// benchmark_fuzzer_leet.js
// Compares leet string transformation: RegExp .replace() with callback vs single-pass character traversal

const { performance } = require('perf_hooks');

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
    let out = '';
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        switch (c) {
            case 'e': case 'E': out += '3'; break;
            case 'a': case 'A': out += '4'; break;
            case 's': case 'S': out += '5'; break;
            case 'o': case 'O': out += '0'; break;
            default: out += c; break;
        }
    }
    return out;
}

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025"];
const iterations = 500000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${testInputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        regexLeet(input);
        loopLeet(input);
    }
}

const startRegex = performance.now();
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        regexLeet(input);
    }
}
const endRegex = performance.now();
const regexTime = endRegex - startRegex;
console.log(`RegExp .replace(LEET_REGEX, callback): ${regexTime.toFixed(2)}ms`);

const startLoop = performance.now();
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        loopLeet(input);
    }
}
const endLoop = performance.now();
const loopTime = endLoop - startLoop;
console.log(`Single-pass character loop:            ${loopTime.toFixed(2)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Speedup:                               ${speedup.toFixed(2)}% faster\n`);
