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

    it('should throw TypeError if input is not a string', () => {
        expect(() => generateVariations(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(undefined)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(['foo'])).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw RangeError if input length exceeds 250 characters', () => {
        const longInput = 'a'.repeat(251);
        expect(() => generateVariations(longInput)).to.throw(RangeError, 'Input length must not exceed 250 characters');
    });

    it('should cache fuzzer variations and return cached results for subsequent calls', () => {
        const base = 'cachetest';
        const res1 = generateVariations(base);
        const res2 = generateVariations(base);
        expect(res1).to.equal(res2); // Should return the exact same array reference (cache hit)
    });

    it('should handle eviction when cache exceeds MAX_CACHE_SIZE', () => {
        // Generate variations for MAX_CACHE_SIZE + 5 items to trigger eviction
        const limit = 1005;
        // The first item
        const first = 'item_0';
        const resFirst1 = generateVariations(first);

        for (let i = 1; i <= limit; i++) {
            generateVariations(`item_${i}`);
        }

        // The first item should have been evicted now.
        // A subsequent call with 'item_0' should return a new array instance.
        const resFirst2 = generateVariations(first);
        expect(resFirst1).to.not.equal(resFirst2);
        expect(resFirst1).to.deep.equal(resFirst2);
    });
});
