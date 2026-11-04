// benchmark_fuzzer_compare.js
// Compares fuzzer variations generation and leet string transformation:
// 1. RegExp with callback replace vs single-pass toLeet loop
// 2. Original Set + Array.from allocation vs optimized generateVariations

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

function toLeetRegex(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeetLoop(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        switch (ch) {
            case 'e': case 'E': out += '3'; break;
            case 'a': case 'A': out += '4'; break;
            case 's': case 'S': out += '5'; break;
            case 'o': case 'O': out += '0'; break;
            default: out += ch; break;
        }
    }
    return out;
}

function generateVariationsWithSet(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(reverseString(baseString));
    const leet = toLeetRegex(baseString);
    variations.add(leet);
    return Array.from(variations);
}

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025"];
const iterations = 500000;

console.log("--- 1. Benchmarking toLeet Transformation (500,000 iterations x 4 inputs) ---");

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
        toLeetLoop(input);
    }
}

const startRegex = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
    }
}
const endRegex = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = endRegex - startRegex;
console.log(`RegExp .replace(LEET_REGEX, callback): ${regexTime.toFixed(4)}ms`);

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetLoop(input);
    }
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Single-pass toLeet character loop:     ${loopTime.toFixed(4)}ms`);

const leetSpeedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Leet transformation speedup:           ${leetSpeedup.toFixed(2)}% faster\n`);

console.log("--- 2. Benchmarking Overall generateVariations (500,000 iterations x 4 inputs) ---");

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        generateVariationsWithSet(input);
        generateVariations(input);
    }
}

const startSet = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariationsWithSet(input);
    }
}
const endSet = parseFloat(process.hrtime.bigint()) / 1e6;
const setTime = endSet - startSet;
console.log(`Original Set + RegExp .replace:        ${setTime.toFixed(4)}ms`);

const startArray = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariations(input);
    }
}
const endArray = parseFloat(process.hrtime.bigint()) / 1e6;
const arrayTime = endArray - startArray;
console.log(`Optimized Direct Array + toLeet loop:  ${arrayTime.toFixed(4)}ms`);

const totalSpeedup = ((setTime - arrayTime) / setTime) * 100;
console.log(`Overall generateVariations speedup:    ${totalSpeedup.toFixed(2)}% faster\n`);
