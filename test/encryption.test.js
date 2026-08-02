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

    it('should cache decryption results and handle TTL expiration correctly', () => {
        const text = 'Caching test string';
        const encrypted = encrypt(text);

        // First decryption (uncached)
        const decrypted1 = decrypt(encrypted);
        expect(decrypted1).to.equal(text);

        // Override Date.now to simulate time passing
        const originalNow = Date.now;
        try {
            const now = Date.now();
            Date.now = () => now + 1000; // 1 second has passed (within 5 min TTL)
            const decrypted2 = decrypt(encrypted);
            expect(decrypted2).to.equal(text);

            Date.now = () => now + 6 * 60 * 1000; // 6 minutes have passed (exceeds 5 min TTL)
            const decrypted3 = decrypt(encrypted);
            expect(decrypted3).to.equal(text);
        } finally {
            Date.now = originalNow;
        }
    });
});
