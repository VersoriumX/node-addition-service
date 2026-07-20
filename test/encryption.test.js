const { expect } = require('chai');
const { encrypt, decrypt } = require('../src/encryption');

describe('Encryption Service', () => {
    it('should encrypt and decrypt text correctly', () => {
        const text = 'Hello VersoriumX';
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).to.equal(text);
    });

    it('should reject non-string inputs', () => {
        expect(() => encrypt(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => decrypt(123)).to.throw(TypeError, 'Input must be a string');
    });

    it('should reject extremely long inputs to prevent padding overflow crashes', () => {
        const longInput = 'a'.repeat(246);
        expect(() => encrypt(longInput)).to.throw(RangeError, 'Text exceeds maximum safe length of 245 characters');
    });
});
