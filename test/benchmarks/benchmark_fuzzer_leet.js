// benchmark_fuzzer_leet.js
// Measures performance gain of single-pass character traversal vs RegExp callback replacement for leet transformation

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function toLeetRegex(baseString) {
    return baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeetSwitch(str) {
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

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025", "passwords_and_tokens_fuzzing"];
const iterations = 1000000;

console.log("--- Benchmarking Leet Transformation (1,000,000 iterations x 5 inputs) ---");

// Warmup
for (let i = 0; i < 10000; i++) {
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
console.log(`Original RegExp .replace(): ${regexTime.toFixed(4)}ms`);

const startSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetSwitch(input);
    }
}
const endSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
const switchTime = endSwitch - startSwitch;
console.log(`Optimized Single-Pass toLeet(): ${switchTime.toFixed(4)}ms`);

const speedup = ((regexTime - switchTime) / regexTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
