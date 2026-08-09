const { expect } = require('chai');
const { generateVariations, fuzzerCache } = require('../src/fuzzer');

describe('Fuzzer Service', () => {
    beforeEach(() => {
        fuzzerCache.clear();
    });

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

    it('should cache fuzzer results and return the exact same array reference', () => {
        const input = 'performance';
        const res1 = generateVariations(input);
        const res2 = generateVariations(input);
        expect(res1).to.equal(res2); // Same reference means it was served from the cache
        expect(fuzzerCache.has(input)).to.be.true;
    });

    it('should evict expired cache entries based on TTL', () => {
        const input = 'ttl_test';
        generateVariations(input);
        expect(fuzzerCache.has(input)).to.be.true;

        // Force expiration by mutating the cached expiry timestamp to the past
        const entry = fuzzerCache.get(input);
        entry.expiry = Date.now() - 1000;

        // Calling generateVariations again should evict and re-calculate
        const res = generateVariations(input);
        expect(fuzzerCache.get(input).expiry).to.be.greaterThan(Date.now());
    });

    it('should enforce MAX_CACHE_SIZE limits and use FIFO eviction policy', () => {
        // Populate cache up to the MAX_CACHE_SIZE (1000)
        for (let i = 0; i < 1000; i++) {
            generateVariations(`input_${i}`);
        }
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input_0')).to.be.true;

        // Add 1001st token to trigger eviction
        generateVariations('input_1000');

        // Cache size should remain 1000, and the oldest element ('input_0') should have been evicted
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input_0')).to.be.false;
        expect(fuzzerCache.has('input_1')).to.be.true;
        expect(fuzzerCache.has('input_1000')).to.be.true;
    });
});
