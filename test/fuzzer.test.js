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

    it('should cache fuzzer variations and return the cached result on subsequent calls', () => {
        const input = 'testcache';

        // First call - should calculate and cache
        const res1 = generateVariations(input);
        expect(fuzzerCache.has(input)).to.be.true;
        expect(fuzzerCache.size).to.equal(1);

        // Second call - should return cached array reference
        const res2 = generateVariations(input);
        expect(res1).to.equal(res2);
    });

    it('should handle TTL expiration and evict expired entries', () => {
        const input = 'ttlcheck';
        generateVariations(input);

        expect(fuzzerCache.has(input)).to.be.true;

        // Manually set expiry to the past to simulate TTL expiration
        const cachedEntry = fuzzerCache.get(input);
        cachedEntry.expiry = Date.now() - 1000;

        // Second call should detect expiration, delete expired entry, recalculate, and re-cache
        const res2 = generateVariations(input);
        expect(fuzzerCache.has(input)).to.be.true;
        const newCachedEntry = fuzzerCache.get(input);
        expect(newCachedEntry.expiry).to.be.greaterThan(Date.now());
    });

    it('should enforce MAX_CACHE_SIZE limit and evict oldest entry using FIFO', () => {
        // Fill cache up to MAX_CACHE_SIZE = 1000
        for (let i = 0; i < 1000; i++) {
            generateVariations(`input_${i}`);
        }
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input_0')).to.be.true;

        // Add 1001st entry - should evict 'input_0'
        generateVariations('input_1000');
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input_0')).to.be.false;
        expect(fuzzerCache.has('input_1000')).to.be.true;
    });
});
