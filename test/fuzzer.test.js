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

    it('should retrieve deterministic variations from cache on successive calls', () => {
        const base = 'cachetest';
        const result1 = generateVariations(base);
        const result2 = generateVariations(base);
        // Direct reference equality checks that we got the exact same array from the cache
        expect(result1).to.equal(result2);
    });

    it('should evict the oldest entry (FIFO) when cache exceeds MAX_CACHE_SIZE', () => {
        // We will seed the cache with an initial sentinel entry
        const oldestKey = 'oldest_key';
        const oldestResult = generateVariations(oldestKey);

        // Verify it is cached
        const oldestResultCached = generateVariations(oldestKey);
        expect(oldestResultCached).to.equal(oldestResult);

        // Fill up the cache. MAX_CACHE_SIZE is 1000.
        // Since we already have some items in the cache from previous tests,
        // we'll push 1010 unique entries to guarantee eviction.
        for (let i = 0; i < 1010; i++) {
            generateVariations(`fill_cache_${i}`);
        }

        // The oldest entry should now be evicted from the cache.
        // Therefore, calling it again should compute a brand new array reference.
        const postEvictionResult = generateVariations(oldestKey);
        expect(postEvictionResult).to.not.equal(oldestResult);
        expect(postEvictionResult).to.deep.equal(oldestResult);
    });
});
