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
});
