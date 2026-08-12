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

    describe('Caching & Eviction Behavior', () => {
        const { _fuzzerCache, _MAX_CACHE_SIZE } = require('../src/fuzzer');

        beforeEach(() => {
            _fuzzerCache.clear();
        });

        it('should cache and return the exact same variations array on repeated calls', () => {
            const input = 'bolt-speed';
            const variations1 = generateVariations(input);
            const variations2 = generateVariations(input);

            expect(variations1).to.equal(variations2); // checks reference equality, proving cache hit
            expect(_fuzzerCache.has(input)).to.be.true;
        });

        it('should evict the oldest key (FIFO) when cache size exceeds the limit', () => {
            // Fill cache to MAX_CACHE_SIZE
            for (let i = 0; i < _MAX_CACHE_SIZE; i++) {
                generateVariations(`input-${i}`);
            }
            expect(_fuzzerCache.size).to.equal(_MAX_CACHE_SIZE);
            expect(_fuzzerCache.has('input-0')).to.be.true;

            // Trigger eviction by adding one more
            generateVariations('overflow-input');
            expect(_fuzzerCache.size).to.equal(_MAX_CACHE_SIZE);
            expect(_fuzzerCache.has('input-0')).to.be.false; // oldest evicted
            expect(_fuzzerCache.has('input-1')).to.be.true; // next oldest remains
            expect(_fuzzerCache.has('overflow-input')).to.be.true; // newest present
        });

        it('should evict and recalculate if cache entry TTL is expired', () => {
            const input = 'ttl-test';
            const variations1 = generateVariations(input);

            // Manually modify the expiration timestamp in the cache to the past
            const cachedEntry = _fuzzerCache.get(input);
            expect(cachedEntry).to.exist;
            cachedEntry.expiry = Date.now() - 1000; // 1 second ago

            const variations2 = generateVariations(input);
            // Reference should be different as it was evicted and recalculated
            expect(variations1).to.not.equal(variations2);
        });
    });
});
