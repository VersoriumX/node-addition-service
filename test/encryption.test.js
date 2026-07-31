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

    describe('Decryption Cache', () => {
        it('should return correct decrypted value on cache hit', () => {
            const originalText = 'Bolt is fast!';
            const encrypted = encrypt(originalText);

            // First call (cache miss, actual decrypt)
            const decrypted1 = decrypt(encrypted);
            expect(decrypted1).to.equal(originalText);

            // Second call (cache hit)
            const decrypted2 = decrypt(encrypted);
            expect(decrypted2).to.equal(originalText);
        });

        it('should perform cached decryption significantly faster than first decryption', () => {
            const originalText = 'Decryption speed optimization!';
            const encrypted = encrypt(originalText);

            const start1 = process.hrtime.bigint();
            decrypt(encrypted);
            const end1 = process.hrtime.bigint();
            const time1 = Number(end1 - start1);

            const start2 = process.hrtime.bigint();
            decrypt(encrypted);
            const end2 = process.hrtime.bigint();
            const time2 = Number(end2 - start2);

            // Cached decryption should be much faster than non-cached RSA decryption
            expect(time2).to.be.lessThan(time1);
        });
    });
});
