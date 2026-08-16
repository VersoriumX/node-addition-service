const { describe, it } = require('mocha');
const { expect } = require('chai');
const { fetchMetalPrices, fetchCryptoPrices } = require('../src/api');

describe('API Service Error Log Redaction', () => {
    it('should redact sensitive query params in error logs when fetching metal prices fails', async () => {
        let loggedError = '';
        const originalConsoleError = console.error;
        console.error = (msg) => {
            loggedError += msg;
        };

        try {
            await fetchMetalPrices();
        } catch (err) {
            // Expected failure due to invalid/fake API endpoint or key response
        } finally {
            console.error = originalConsoleError;
        }

        expect(loggedError).to.not.contain('YOUR_METALS_API_KEY');
        expect(loggedError).to.contain('[REDACTED]');
    });

    it('should redact sensitive query params in error logs when fetching crypto prices fails', async () => {
        let loggedError = '';
        const originalConsoleError = console.error;
        console.error = (msg) => {
            loggedError += msg;
        };

        try {
            await fetchCryptoPrices();
        } catch (err) {
            // Expected failure
        } finally {
            console.error = originalConsoleError;
        }

        expect(loggedError).to.not.contain('YOUR_CRYPTO_API_KEY');
        expect(loggedError).to.contain('[REDACTED]');
    });
});
