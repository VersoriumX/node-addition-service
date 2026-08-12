const { expect } = require('chai');
const { generateVariations, fuzzerCache } = require('../src/fuzzer');

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

    describe('Fuzzer Cache', () => {
        beforeEach(() => {
            fuzzerCache.clear();
        });

        it('should return identical cached reference on subsequent calls', () => {
            const base = 'cache-test-string';
            const variations1 = generateVariations(base);
            const variations2 = generateVariations(base);
            expect(variations1).to.equal(variations2); // check reference equality
        });

        it('should handle TTL expiration and recalculate variations', () => {
            const base = 'ttl-test-string';
            const variations1 = generateVariations(base);

            // Manipulate the cache entry to simulate expiry
            const cached = fuzzerCache.get(base);
            expect(cached).to.exist;
            cached.expiry = Date.now() - 1000; // set expiry in the past

            const variations2 = generateVariations(base);
            expect(variations1).to.not.equal(variations2); // references should differ
        });

        it('should evict the oldest entry on exceeding MAX_CACHE_SIZE', () => {
            // Fill cache up to capacity
            const MAX_SIZE = 1000;
            const firstKey = 'key-0';
            generateVariations(firstKey);

            for (let i = 1; i < MAX_SIZE; i++) {
                generateVariations(`key-${i}`);
            }

            expect(fuzzerCache.size).to.equal(MAX_SIZE);
            expect(fuzzerCache.has(firstKey)).to.be.true;

            // Exceed capacity
            generateVariations('exceed-key');

            expect(fuzzerCache.size).to.equal(MAX_SIZE);
            expect(fuzzerCache.has(firstKey)).to.be.false; // oldest key should be evicted
            expect(fuzzerCache.has('exceed-key')).to.be.true;
        });
    });
});
