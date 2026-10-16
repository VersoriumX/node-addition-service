// benchmark_fuzzer_compare.js
// Compares fuzzer variations generation: Set instantiation vs direct array construction

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

function generateVariationsWithSet(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(reverseString(baseString));
    const leet = baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
    variations.add(leet);
    return Array.from(variations);
}

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025"];
const iterations = 500000;

console.log("--- Benchmarking generateVariations Allocation Optimization (500,000 iterations x 4 inputs) ---");

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
console.log(`Original Set + Array.from Allocation: ${setTime.toFixed(4)}ms`);

const startArray = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        generateVariations(input);
    }
}
const endArray = parseFloat(process.hrtime.bigint()) / 1e6;
const arrayTime = endArray - startArray;
console.log(`Optimized Direct Array Construction: ${arrayTime.toFixed(4)}ms`);

const speedup = ((setTime - arrayTime) / setTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
