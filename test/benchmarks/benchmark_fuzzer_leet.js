const { performance } = require('perf_hooks');

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function leetRegex(baseString) {
    return baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
}

function toLeet(str) {
    let res = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
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

const inputs = ["pass", "hello", "The Quick Brown Fox!", "123", "admin_user_2025", "extra_long_string_with_many_letters_to_fuzz_test_variation_generation"];
const iterations = 500000;

console.log(`--- Benchmarking Leet Transformation (${iterations.toLocaleString()} iterations x ${inputs.length} inputs) ---`);

// Warmup
for (let i = 0; i < 10000; i++) {
    for (const inp of inputs) {
        leetRegex(inp);
        toLeet(inp);
    }
}

const startRegex = performance.now();
for (let i = 0; i < iterations; i++) {
    for (const inp of inputs) {
        leetRegex(inp);
    }
}
const endRegex = performance.now();

const startLoop = performance.now();
for (let i = 0; i < iterations; i++) {
    for (const inp of inputs) {
        toLeet(inp);
    }
}
const endLoop = performance.now();

const timeRegex = endRegex - startRegex;
const timeLoop = endLoop - startLoop;
const speedup = ((timeRegex - timeLoop) / timeRegex) * 100;

console.log(`RegExp replace: ${timeRegex.toFixed(2)}ms`);
console.log(`Direct loop:    ${timeLoop.toFixed(2)}ms`);
console.log(`Speedup:        ${speedup.toFixed(2)}% faster\n`);
