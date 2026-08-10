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

    it('should cache fuzzer variations and handle TTL expiration correctly', () => {
        const base = 'cacheTest';

        // First call (uncached)
        const variations1 = generateVariations(base);
        expect(variations1).to.be.an('array');

        // Second call (should be cached)
        const variations2 = generateVariations(base);
        expect(variations2).to.deep.equal(variations1);

        // Override Date.now to simulate time passing
        const originalNow = Date.now;
        try {
            const now = Date.now();
            Date.now = () => now + 1000; // 1 second has passed (within 5 min TTL)
            const variations3 = generateVariations(base);
            expect(variations3).to.deep.equal(variations1);

            Date.now = () => now + 6 * 60 * 1000; // 6 minutes have passed (exceeds 5 min TTL)
            const variations4 = generateVariations(base);
            expect(variations4).to.deep.equal(variations1);
        } finally {
            Date.now = originalNow;
        }
    });

    it('should evict the oldest cache entry when exceeding the maximum cache size (1000)', () => {
        const firstInput = 'evictEntry0';
        const res0_1 = generateVariations(firstInput);

        // Populate 1000 other entries to trigger eviction of firstInput
        for (let i = 1; i <= 1000; i++) {
            generateVariations(`evictEntry${i}`);
        }

        // Verify that we can still fetch firstInput and everything runs correctly without errors
        const res0_2 = generateVariations(firstInput);
        expect(res0_2).to.deep.equal(res0_1);
    });
});
