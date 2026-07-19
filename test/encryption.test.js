const { expect } = require('chai');
const { encrypt, decrypt } = require('../src/encryption');

describe('Encryption Service', () => {
    it('should encrypt and decrypt text correctly', () => {
        const text = 'Hello VersoriumX';
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).to.equal(text);
    });

    it('should successfully encrypt and decrypt a string of exactly 245 characters', () => {
        const text = 'a'.repeat(245);
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).to.equal(text);
    });

    it('should throw an error when trying to encrypt a string of more than 245 characters', () => {
        const text = 'a'.repeat(246);
        expect(() => encrypt(text)).to.throw();
    });
});
