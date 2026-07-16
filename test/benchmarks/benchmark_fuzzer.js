const { generateVariations } = require('../../src/fuzzer');

const input = "The quick brown fox jumps over the lazy dog";
const iterations = 100000;

console.time('generateVariations');
for (let i = 0; i < iterations; i++) {
    generateVariations(input);
}
console.timeEnd('generateVariations');
