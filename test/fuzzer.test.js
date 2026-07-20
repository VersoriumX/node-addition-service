const { expect } = require('chai');
const { generateVariations } = require('../src/fuzzer');

describe('Fuzzer Service', () => {
    it('should generate variations of a string', () => {
        const base = 'pass';
        const variations = generateVariations(base);
        expect(variations).to.be.an('array');
        expect(variations).to.include('PASS');
        expect(variations).to.include('p455');
    });

    it('should reject non-string inputs', () => {
        expect(() => generateVariations(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should reject extremely long inputs to prevent high resource usage / DoS', () => {
        const longInput = 'a'.repeat(251);
        expect(() => generateVariations(longInput)).to.throw(RangeError, 'Input length must not exceed 250 characters');
    });
});
