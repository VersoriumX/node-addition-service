// benchmark_fuzzer_leet.js
// Compares leet string transformation: RegExp .replace(LEET_REGEX, callback) vs Single-pass loop

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function leetRegex(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeet(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
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

const testInputs = ["hello", "The Quick Brown Fox!", "123", "admin_user_2025", "passwords_are_awesome_and_secure"];
const iterations = 500000;

console.log("--- Benchmarking Leet Transformation: RegExp replace vs Single-pass loop (500,000 iterations x 5 inputs) ---");

// Warmup
for (let i = 0; i < 5000; i++) {
    for (const input of testInputs) {
        leetRegex(input);
        toLeet(input);
    }
}

const t0 = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        leetRegex(input);
    }
}
const t1 = parseFloat(process.hrtime.bigint()) / 1e6;
const regexTime = t1 - t0;
console.log(`RegExp .replace(LEET_REGEX, callback): ${regexTime.toFixed(4)}ms`);

const t2 = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    for (const input of testInputs) {
        toLeet(input);
    }
}
const t3 = parseFloat(process.hrtime.bigint()) / 1e6;
const loopTime = t3 - t2;
console.log(`Optimized Single-pass Character Traversal: ${loopTime.toFixed(4)}ms`);

const speedup = ((regexTime - loopTime) / regexTime) * 100;
console.log(`Estimated Performance Gain: ${speedup.toFixed(2)}% faster\n`);
