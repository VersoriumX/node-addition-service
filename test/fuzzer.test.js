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

    it('should cache fuzzer variations and return identical array references on successive calls', () => {
        const input = 'bolt-speed';
        const result1 = generateVariations(input);
        const result2 = generateVariations(input);
        expect(result1).to.equal(result2); // identical array reference
    });

    it('should handle TTL cache expiration correctly', () => {
        const input = 'ttl-test-string';
        const result1 = generateVariations(input);

        // Override Date.now to simulate passage of time
        const originalNow = Date.now;
        try {
            const now = Date.now();
            Date.now = () => now + 1000; // 1 second later (within 5 min TTL)
            const result2 = generateVariations(input);
            expect(result2).to.equal(result1); // still cached

            Date.now = () => now + 6 * 60 * 1000; // 6 minutes later (exceeds TTL)
            const result3 = generateVariations(input);
            expect(result3).to.not.equal(result1); // recalculated (cache miss/eviction)
            expect(result3).to.deep.equal(result1); // content is identical
        } finally {
            Date.now = originalNow;
        }
    });

    it('should evict the oldest entry (FIFO) when cache size exceeds 1000', () => {
        // Initial input
        const oldestInput = 'oldest-input-item';
        const oldestResult = generateVariations(oldestInput);

        // Generate 1000 other distinct cache entries
        for (let i = 0; i < 1000; i++) {
            generateVariations(`distinct-fuzzer-item-${i}`);
        }

        // The oldest input should have been evicted
        const newResult = generateVariations(oldestInput);
        expect(newResult).to.not.equal(oldestResult); // Recalculated due to eviction
        expect(newResult).to.deep.equal(oldestResult); // But value remains same
    });
});
