// benchmark_fuzzer_leet.js
// Compares RegExp replace with callback vs single-pass toLeet character traversal loop

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
    const len = str.length;
    for (let i = 0; i < len; i++) {
        const ch = str[i];
        switch (ch) {
            case 'e': case 'E': result += '3'; break;
            case 'a': case 'A': result += '4'; break;
            case 's': case 'S': result += '5'; break;
            case 'o': case 'O': result += '0'; break;
            default: result += ch; break;
        }
    }
    return result;
}

const testInputs = [
    "hello",
    "The Quick Brown Fox!",
    "123",
    "admin_user_2025",
    "supercalifragilisticexpialidocious"
];
const iterations = 500000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${testInputs.length} inputs) ---`);

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
console.log(`Original RegExp replace with callback: ${regexTime.toFixed(4)}ms`);

const startLoop = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetLoop(input);
    }
}
const endLoop = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = endLoop - startLoop;
console.log(`Optimized toLeet character traversal: ${loopTime.toFixed(4)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
