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

    it('should throw an error if input is not a string', () => {
        expect(() => generateVariations(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(undefined)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(['invalid'])).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw an error if input exceeds length limit', () => {
        const longStr = 'a'.repeat(251);
        expect(() => generateVariations(longStr)).to.throw(Error, 'Input length exceeds maximum allowed of 250 characters');
    });
});
