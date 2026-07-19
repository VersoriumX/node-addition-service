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

    it('should throw TypeError when input is not a string', () => {
        expect(() => generateVariations(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw RangeError when input length is greater than 250 characters', () => {
        const base = 'a'.repeat(251);
        expect(() => generateVariations(base)).to.throw(RangeError, 'Input is too long (max 250 characters)');
    });

    it('should work successfully when input length is exactly 250 characters', () => {
        const base = 'a'.repeat(250);
        const variations = generateVariations(base);
        expect(variations).to.be.an('array');
        expect(variations.length).to.be.greaterThan(0);
    });
});
