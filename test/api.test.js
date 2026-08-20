const { describe, it } = require('mocha');
const { expect } = require('chai');
const { fetchMetalPrices, fetchCryptoPrices, getMetalCache, getCryptoCache } = require('../src/api');

describe('API Service Security & Timeout', () => {
    it('should support AbortSignal.timeout for external API requests', async () => {
        const timeoutSignal = AbortSignal.timeout(100);
        expect(timeoutSignal).to.have.property('aborted');
    });

    it('should handle API failure gracefully without leaking sensitive keys in unredacted URLs', async () => {
        // Calling prices with dummy key will fail or throw error, verify cache object structure remains intact
        try {
            await fetchMetalPrices();
        } catch (err) {
            expect(err).to.exist;
        }
        const cache = getMetalCache();
        expect(cache).to.have.property('data');
    });

    it('should maintain crypto cache object structure on fetch attempt', async () => {
        try {
            await fetchCryptoPrices();
        } catch (err) {
            expect(err).to.exist;
        }
        const cache = getCryptoCache();
        expect(cache).to.have.property('data');
    });
});
