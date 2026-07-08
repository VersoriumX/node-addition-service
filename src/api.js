const fetch = require('node-fetch');
const config = require('./config');

const CACHE_DURATION = 60 * 1000; // 1 minute cache
let metalCache = { data: null, timestamp: 0 };
let cryptoCache = { data: null, timestamp: 0 };

/**
 * ⚡ Bolt Optimization: Request Coalescing (Promise Memoization)
 * This map tracks ongoing requests by URL to prevent the 'Thundering Herd' problem.
 * Concurrent requests for the same resource will await the same promise instead
 * of triggering multiple redundant network calls.
 */
const pendingPromises = new Map();

async function fetchWithCache(url, cache, headers = {}) {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
        return cache.data;
    }

    // ⚡ Bolt Optimization: If there's already an in-flight request for this URL, join it.
    if (pendingPromises.has(url)) {
        return pendingPromises.get(url);
    }

    const fetchPromise = (async () => {
        try {
            const response = await fetch(url, { headers, timeout: 15000 });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            cache.data = data;
            cache.timestamp = Date.now();
            return data;
        } catch (error) {
            /**
             * 🛡️ Sentinel Security Enhancement:
             * Redact sensitive query parameters from URLs in error logs to prevent credential leakage.
             * We log only the error message to avoid potential secret leakage via the full error object properties.
             */
            const redactedUrl = url.replace(/(access_key|CMC_PRO_API_KEY)=([^&]+)/g, '$1=[REDACTED]');
            console.error(`Error fetching from ${redactedUrl}: ${error.message}`);
            if (cache.data) return cache.data; // Return stale data on error
            throw error;
        } finally {
            // Remove from pending once settled
            pendingPromises.delete(url);
        }
    })();

    pendingPromises.set(url, fetchPromise);
    return fetchPromise;
}

async function fetchMetalPrices() {
    const url = `https://metals-api.com/api/latest?access_key=${config.metalsApiKey}&currencies=XAU,XPT,XAG,NICKEL,COPPER`;
    return fetchWithCache(url, metalCache);
}

async function fetchCryptoPrices() {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH&CMC_PRO_API_KEY=${config.cryptoApiKey}`;
    return fetchWithCache(url, cryptoCache);
}

module.exports = { fetchMetalPrices, fetchCryptoPrices };
