const { generateVariations } = require('../../src/fuzzer');

const input = "Sentinel-Bolt-Optimization-Test-String";
const iterations = 100000;

console.log(`Running benchmark for generateVariations with ${iterations} iterations...`);

const start = Date.now();
for (let i = 0; i < iterations; i++) {
    generateVariations(input);
}
const end = Date.now();

console.log(`Time taken: ${end - start}ms`);
console.log(`Average time per call: ${(end - start) / iterations}ms`);
