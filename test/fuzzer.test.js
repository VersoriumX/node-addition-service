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

    it('should cache fuzzer results and handle TTL expiration correctly', () => {
        const base = 'cachetest';
        expect(fuzzerCache.size).to.equal(0);

        // First call populates cache
        const res1 = generateVariations(base);
        expect(fuzzerCache.size).to.equal(1);
        expect(fuzzerCache.has(base)).to.be.true;

        // Second call should return cached array
        const res2 = generateVariations(base);
        expect(res1).to.equal(res2); // returns exact same reference indicating cache hit

        // Simulate expiration
        const cached = fuzzerCache.get(base);
        cached.expiry = Date.now() - 1000; // set expired

        // Next call should miss cache, delete/repopulate it, returning a new array
        const res3 = generateVariations(base);
        expect(res3).to.not.equal(res1);
        expect(fuzzerCache.size).to.equal(1);
    });

    it('should limit cache size and perform FIFO eviction correctly', () => {
        // Fill cache up to limit
        for (let i = 0; i < 1000; i++) {
            generateVariations(`input-${i}`);
        }
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input-0')).to.be.true;

        // Adding one more should evict 'input-0'
        generateVariations('input-1000');
        expect(fuzzerCache.size).to.equal(1000);
        expect(fuzzerCache.has('input-0')).to.be.false;
        expect(fuzzerCache.has('input-1')).to.be.true;
        expect(fuzzerCache.has('input-1000')).to.be.true;
    });
});
