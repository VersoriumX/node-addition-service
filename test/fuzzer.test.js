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

    describe('Fuzzer Cache', () => {
        const { fuzzerCache, MAX_CACHE_SIZE } = require('../src/fuzzer');

        beforeEach(() => {
            fuzzerCache.clear();
        });

        it('should cache fuzzer results and return the cached array on subsequent calls', () => {
            const base = 'cachetest';
            const variations1 = generateVariations(base);
            const variations2 = generateVariations(base);

            expect(variations1).to.equal(variations2); // Should refer to the exact same array reference in memory
        });

        it('should handle TTL expiration correctly', () => {
            const base = 'ttltest';
            const variations1 = generateVariations(base);

            // Mock cache expiration
            const entry = fuzzerCache.get(base);
            expect(entry).to.exist;
            entry.expiry = Date.now() - 1000; // set expiry in the past

            const variations2 = generateVariations(base);
            expect(variations1).to.not.equal(variations2); // Should have evicted and generated a new array reference
        });

        it('should enforce FIFO eviction policy when maximum cache size is reached', () => {
            // Fill cache up to MAX_CACHE_SIZE
            const strings = [];
            for (let i = 0; i < MAX_CACHE_SIZE; i++) {
                const s = `str_${i}`;
                strings.push(s);
                generateVariations(s);
            }

            expect(fuzzerCache.size).to.equal(MAX_CACHE_SIZE);
            expect(fuzzerCache.has(strings[0])).to.be.true;

            // Trigger eviction of the oldest entry by adding one more item
            generateVariations('extra_item');

            expect(fuzzerCache.size).to.equal(MAX_CACHE_SIZE);
            expect(fuzzerCache.has(strings[0])).to.be.false; // The first item should have been evicted
            expect(fuzzerCache.has('extra_item')).to.be.true;
        });
    });
});
