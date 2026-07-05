const fetch = require('node-fetch');
const config = require('./config');

const CACHE_DURATION = 60 * 1000; // 1 minute cache
let metalCache = { data: null, timestamp: 0, pendingPromise: null };
let cryptoCache = { data: null, timestamp: 0, pendingPromise: null };

/**
 * ⚡ Bolt Optimization: Request Coalescing
 * If multiple requests for the same resource arrive while a network fetch
 * is already in progress, they will all wait for the same promise instead
 * of triggering multiple redundant network calls.
 */
async function fetchWithCache(url, cache, headers = {}) {
    const now = Date.now();

    // 1. Check if we have valid cached data
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
        return cache.data;
    }

    // 2. ⚡ Bolt: Check if a request is already in flight (Request Coalescing)
    if (cache.pendingPromise) {
        return cache.pendingPromise;
    }

    // 3. Start a new network fetch and store the promise
    cache.pendingPromise = (async () => {
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            cache.data = data;
            cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
            if (cache.data) return cache.data; // Return stale data on error
            throw error;
        } finally {
            // Clear the pending promise so future requests can trigger a new fetch if needed
            cache.pendingPromise = null;
        }
    })();

    return cache.pendingPromise;
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
