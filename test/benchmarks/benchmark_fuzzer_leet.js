// benchmark_fuzzer_leet.js
// Compares leet string transformation: RegExp .replace() with callback vs single-pass toLeet loop

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function toLeetRegExp(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeetSwitch(str) {
    let res = '';
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        switch (c) {
            case 'e': case 'E': res += '3'; break;
            case 'a': case 'A': res += '4'; break;
            case 's': case 'S': res += '5'; break;
            case 'o': case 'O': res += '0'; break;
            default: res += c;
        }
    }
    return res;
}

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025"];
const iterations = 1000000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${testInputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const input of testInputs) {
        toLeetRegExp(input);
        toLeetSwitch(input);
    }
}

const startRegExp = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetRegExp(input);
    }
}
const endRegExp = parseFloat(process.hrtime.bigint()) / 1e6;
const regExpTime = endRegExp - startRegExp;
console.log(`RegExp .replace(LEET_REGEX, callback): ${regExpTime.toFixed(4)}ms`);

const startSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeetSwitch(input);
    }
}
const endSwitch = parseFloat(process.hrtime.bigint()) / 1e6;
const switchTime = endSwitch - startSwitch;
console.log(`Optimized Single-Pass toLeet():       ${switchTime.toFixed(4)}ms`);

const speedup = ((regExpTime - switchTime) / regExpTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
