// benchmark_fuzzer_compare.js
// Compares fuzzer variations generation: RegExp replace callback vs single-pass switch-case toLeet loop

const { generateVariations } = require('../../src/fuzzer');

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function reverseString(str) {
    let rev = '';
    for (let i = str.length - 1; i >= 0; i--) {
        rev += str[i];
    }
    return rev;
}

function generateVariationsWithRegex(baseString) {
    const v1 = baseString;
    const v2 = baseString.toUpperCase();
    const v3 = baseString.toLowerCase();
    const v4 = baseString + "123";
    const v5 = baseString + "!";
    const v6 = reverseString(baseString);
    const v7 = baseString.replace(LEET_REGEX, m => LEET_MAP[m]);

    const variations = [v1];
    if (v2 !== v1) variations.push(v2);
    if (v3 !== v1 && v3 !== v2) variations.push(v3);
    if (!variations.includes(v4)) variations.push(v4);
    if (!variations.includes(v5)) variations.push(v5);
    if (!variations.includes(v6)) variations.push(v6);
    if (!variations.includes(v7)) variations.push(v7);

    return variations;
}

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025"];
const iterations = 500000;

console.log("--- Benchmarking generateVariations Leet Conversion Optimization (500,000 iterations x 4 inputs) ---");

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        generateVariationsWithRegex(input);
        generateVariations(input);
    }
}

const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariationsWithRegex(input);
    }
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`Original RegExp .replace() Callback: ${regexTime.toFixed(4)}ms`);

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariations(input);
    }
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Optimized Single-pass toLeet Loop: ${loopTime.toFixed(4)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
