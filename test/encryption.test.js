const { expect } = require('chai');
const { encrypt, decrypt } = require('../src/encryption');

describe('Encryption Service', () => {
    it('should encrypt and decrypt text correctly', () => {
        const text = 'Hello VersoriumX';
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).to.equal(text);
    });

    it('should throw TypeError if input to encrypt is not a string', () => {
        expect(() => encrypt(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => encrypt(undefined)).to.throw(TypeError, 'Input must be a string');
        expect(() => encrypt(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => encrypt({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw RangeError if input to encrypt exceeds 245 characters', () => {
        const longInput = 'a'.repeat(246);
        expect(() => encrypt(longInput)).to.throw(RangeError, 'Input length must not exceed 245 characters');
    });

    it('should throw TypeError if input to decrypt is not a string', () => {
        expect(() => decrypt(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => decrypt(undefined)).to.throw(TypeError, 'Input must be a string');
        expect(() => decrypt(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => decrypt({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw RangeError if input to decrypt exceeds 500 characters', () => {
        const longInput = 'a'.repeat(501);
        expect(() => decrypt(longInput)).to.throw(RangeError, 'Input length must not exceed 500 characters');
    });

    describe('Decryption Cache Performance', () => {
        it('should return correct decrypted values and serve cached results extremely fast', () => {
            const text = 'Cached decryption test performance';
            const encrypted = encrypt(text);

            // First decryption (will populate the cache)
            const decrypted1 = decrypt(encrypted);
            expect(decrypted1).to.equal(text);

            // Subsequent decryptions (must be extremely fast because they are cached)
            const start = Date.now();
            for (let i = 0; i < 200; i++) {
                const dec = decrypt(encrypted);
                expect(dec).to.equal(text);
            }
            const duration = Date.now() - start;

            // Without caching, 200 RSA 2048-bit decryptions would take ~300ms to 800ms.
            // With caching, it takes < 5ms. We can safely assert it takes less than 50ms.
            expect(duration).to.be.lessThan(50);
        });
    });
});
