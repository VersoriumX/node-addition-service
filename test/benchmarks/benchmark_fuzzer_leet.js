// benchmark_fuzzer_leet.js
// Compares RegExp-based leet replacement vs single-pass toLeet character traversal

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

function toLeetSwitch(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        switch (ch) {
            case 'e': case 'E': result += '3'; break;
            case 'a': case 'A': result += '4'; break;
            case 's': case 'S': result += '5'; break;
            case 'o': case 'O': result += '0'; break;
            default: result += ch;
        }
    }
    return result;
}

const testInputs = ['hello', 'The Quick Brown Fox!', '123', 'admin_user_2025'];
const iterations = 1000000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${testInputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        toLeetRegex(input);
        toLeetSwitch(input);
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
console.log(`RegExp .replace() with callback: ${regexTime.toFixed(4)}ms`);

const startSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetSwitch(input);
    }
}
const endSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
const switchTime = endSwitch - startSwitch;
console.log(`Single-pass toLeet switch traversal: ${switchTime.toFixed(4)}ms`);

const speedup = ((regexTime - switchTime) / regexTime) * 100;
console.log(`Performance Gain: ${speedup.toFixed(2)}% faster\n`);
