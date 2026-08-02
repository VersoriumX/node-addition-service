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
        it('should cache subsequent decryptions correctly', () => {
            const text = 'Secret Cache Test';
            const encrypted = encrypt(text);

            // First decrypt (miss)
            const decrypted1 = decrypt(encrypted);
            expect(decrypted1).to.equal(text);

            // Second decrypt (hit)
            const decrypted2 = decrypt(encrypted);
            expect(decrypted2).to.equal(text);
        });

        it('should evict oldest cached entry when cache size exceeds limit (1000)', () => {
            const NodeRSA = require('node-rsa').NodeRSA;
            const originalDecrypt = NodeRSA.prototype.decrypt;

            // Mock decrypt to be instant and return a dummy value
            NodeRSA.prototype.decrypt = function(text, encoding) {
                return 'decrypted-' + text;
            };

            try {
                // First insert a specific entry we will track
                const firstText = 'First Tracked Entry';
                const firstEncrypted = encrypt(firstText);
                decrypt(firstEncrypted); // Put in cache

                // Generate 1000 additional decryptions to fill and overflow the cache.
                // Since decrypt is mocked, this loop will run in less than 2 milliseconds!
                for (let i = 0; i < 1000; i++) {
                    const text = `Entry-${i}`;
                    const encrypted = `encrypted-${text}`;
                    decrypt(encrypted);
                }

                // Since cache limit is 1000, the first entry must have been evicted.
                // When we decrypt firstEncrypted now, it should trigger a cache miss and call the mocked decrypt.
                const decrypted = decrypt(firstEncrypted);
                expect(decrypted).to.equal('decrypted-' + firstEncrypted);
            } finally {
                NodeRSA.prototype.decrypt = originalDecrypt;
            }
        });

        it('should respect TTL expiration', () => {
            const text = 'TTL Test Entry';
            const encrypted = encrypt(text);
            decrypt(encrypted); // Cache it

            const originalNow = Date.now;
            try {
                // Mock Date.now to simulate 6 minutes passing
                Date.now = () => originalNow() + 6 * 60 * 1000;

                // Decrypt should still return correct result but bypass/refresh cache
                const decrypted = decrypt(encrypted);
                expect(decrypted).to.equal(text);
            } finally {
                Date.now = originalNow;
            }
        });
    });
});
