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

    it('should cache fuzzer variations and return identical elements', () => {
        const input = 'performance';
        const res1 = generateVariations(input);
        const res2 = generateVariations(input);
        expect(res1).to.equal(res2); // Should return the exact same cached reference
    });

    it('should handle TTL expiration and re-generate variations', (done) => {
        const originalNow = Date.now;
        let currentTime = originalNow();
        Date.now = () => currentTime;

        try {
            const input = 'temporal';
            const res1 = generateVariations(input);

            // Advance time by 6 minutes (exceeding CACHE_TTL of 5 minutes)
            currentTime += 6 * 60 * 1000;

            const res2 = generateVariations(input);
            expect(res1).to.not.equal(res2); // Should have regenerated a new array instance
        } finally {
            Date.now = originalNow;
        }
        done();
    });

    it('should evict oldest cached entry when cache size exceeds MAX_CACHE_SIZE (FIFO)', () => {
        // Let's test FIFO eviction
        // MAX_CACHE_SIZE is 1000.
        // First, let's generate variations for input 'oldest'
        const oldestRes = generateVariations('oldest');

        // Verify it is cached
        expect(generateVariations('oldest')).to.equal(oldestRes);

        // Now fill the cache with 1000 more unique entries to trigger eviction of 'oldest'
        for (let i = 0; i < 1000; i++) {
            generateVariations(`entry_${i}`);
        }

        // 'oldest' should now be evicted and regenerated (resulting in a new array reference)
        const checkRes = generateVariations('oldest');
        expect(checkRes).to.not.equal(oldestRes);
    });
});
