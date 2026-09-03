const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { fetchMetalPrices, fetchCryptoPrices } = require('../src/api');

describe('API Service Security & Timeout Configuration', () => {
    it('should use AbortSignal.timeout to enforce external request timeouts', () => {
        const apiSource = fs.readFileSync(path.join(__dirname, '../src/api.js'), 'utf8');
        expect(apiSource).to.contain('signal: AbortSignal.timeout(15000)');
    });

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
