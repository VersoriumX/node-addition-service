// benchmark_fuzzer_leet.js
// Measures performance improvement of single-pass switch-case toLeet traversal
// vs RegExp .replace(LEET_REGEX, callback)

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
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        switch (char) {
            case 'e':
            case 'E':
                result += '3';
                break;
            case 'a':
            case 'A':
                result += '4';
                break;
            case 's':
            case 'S':
                result += '5';
                break;
            case 'o':
            case 'O':
                result += '0';
                break;
            default:
                result += char;
                break;
        }
    }
    return result;
}

const testInputs = [
    "hello",
    "pass",
    "The Quick Brown Fox!",
    "123!@#",
    "admin_user_2025",
    "password_super_secure_enterprise_grade"
];
const iterations = 500000;

console.log("--- Benchmarking Leet Transformation (500,000 iterations x 6 inputs) ---");

// Warmup
for (let i = 0; i < 50000; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
        toLeetLoop(input);
        generateVariations(input);
    }
}

// Benchmark RegExp approach
const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
    }
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`Original RegExp + Callback Replacement: ${regexTime.toFixed(4)}ms`);

// Benchmark Loop approach
const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetLoop(input);
    }
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Optimized Single-Pass toLeet Loop:       ${loopTime.toFixed(4)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Leet Conversion Speedup:                 ${speedup.toFixed(2)}% faster\n`);

// Benchmark full generateVariations
console.log("--- Benchmarking Full generateVariations (500,000 iterations x 6 inputs) ---");
const startFull = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariations(input);
    }
}
const endFull = parseFloat(process.hrtime.bigint()) / 1e6;
const fullTime = endFull - startFull;
console.log(`Optimized generateVariations execution:  ${fullTime.toFixed(4)}ms\n`);
