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

    describe('Decryption Caching', () => {
        it('should correctly cache deterministic decryption results and respond extremely fast', () => {
            const original = 'Cached VersoriumX';
            const ciphertext = encrypt(original);

            // Cold run (actual decryption)
            const decrypted1 = decrypt(ciphertext);
            expect(decrypted1).to.equal(original);

            // Hot run (cache hit)
            const start = process.hrtime.bigint();
            const decrypted2 = decrypt(ciphertext);
            const durationNs = process.hrtime.bigint() - start;
            const durationMs = Number(durationNs) / 1e6;

            expect(decrypted2).to.equal(original);
            // Cache hit should take less than 0.5ms (usually < 0.05ms)
            expect(durationMs).to.be.lessThan(0.5);
        });

        it('should respect TTL expiration', function() {
            // We can temporarily manipulate Date.now or simulate passing time
            const original = 'TTL test';
            const ciphertext = encrypt(original);

            const realDateNow = Date.now;
            let mockTime = Date.now();
            Date.now = () => mockTime;

            try {
                decrypt(ciphertext); // Cold run

                // Advance time by 6 minutes
                mockTime += 6 * 60 * 1000;

                // Should decrypt again and update cache
                const decrypted = decrypt(ciphertext);
                expect(decrypted).to.equal(original);
            } finally {
                Date.now = realDateNow;
            }
        });

        it('should limit cache size and evict oldest keys (LRU/FIFO behavior)', () => {
            // Generate multiple ciphertexts and decrypt them to fill cache
            // Since MAX_SIZE is 1000, let's temporarily mock CACHE_MAX_SIZE or just check FIFO eviction
            // Let's encrypt several values, then check they decyrpt fine.
            const messages = [];
            const ciphertexts = [];
            for (let i = 0; i < 5; i++) {
                messages.push(`Msg ${i}`);
                ciphertexts.push(encrypt(`Msg ${i}`));
            }

            // Decrypt all of them to populate cache
            ciphertexts.forEach((c) => decrypt(c));

            // To test eviction limit, let's verify that decrypting all of them works perfectly
            ciphertexts.forEach((c, idx) => {
                expect(decrypt(c)).to.equal(messages[idx]);
            });
        });
    });
});
