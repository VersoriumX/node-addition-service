const { generateVariations } = require('../../src/fuzzer');

const baseString = "The quick brown fox jumps over the lazy dog";

function currentLeet(str) {
    return str.replace(/e/gi, '3').replace(/a/gi, '4').replace(/s/gi, '5').replace(/o/gi, '0');
}

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;
function optimizedLeet(str) {
    return str.replace(LEET_REGEX, m => LEET_MAP[m]);
}

const iterations = 1000000;

console.log(`Running ${iterations} iterations...`);

console.time('Current');
for (let i = 0; i < iterations; i++) {
    currentLeet(baseString);
}
console.timeEnd('Current');

console.time('Optimized');
for (let i = 0; i < iterations; i++) {
    optimizedLeet(baseString);
}
console.timeEnd('Optimized');
