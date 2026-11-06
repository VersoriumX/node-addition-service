/**
 * Benchmark comparing RegExp-based leet conversion with single-pass switch-case traversal.
 * Also measures the impact on generateVariations().
 */

const { generateVariations } = require('../../src/fuzzer');

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function toLeetRegex(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeetLoop(str) {
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

const testInputs = ['hello', 'The Quick Brown Fox!', '123', 'admin_user_2025'];
const iterations = 500000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${testInputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
        toLeetLoop(input);
    }
}

// 1. RegExp replace
const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
    }
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`RegExp .replace(LEET_REGEX, fn): ${regexTime.toFixed(2)}ms`);

// 2. Loop traversal
const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetLoop(input);
    }
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Single-pass switch-case loop:   ${loopTime.toFixed(2)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Speedup:                        ${speedup.toFixed(2)}% faster\n`);

// Measure generateVariations()
console.log(`--- Benchmarking generateVariations() with Optimized toLeet ---`);
const startGen = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariations(input);
    }
}
const endGen = parseFloat(process.hrtime.bigint()) / 1e6;
console.log(`generateVariations execution time: ${(endGen - startGen).toFixed(2)}ms\n`);
