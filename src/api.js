const fetch = require('node-fetch');
const config = require('./config');

const CACHE_DURATION = 60 * 1000; // 1 minute cache
let metalCache = { data: null, timestamp: 0 };
let cryptoCache = { data: null, timestamp: 0 };

async function fetchWithCache(url, cache, headers = {}) {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
        return cache.data;
    }

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        cache.data = data;
        cache.timestamp = now;
        return data;
    } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        if (cache.data) return cache.data; // Return stale data on error
        throw error;
    }
}

async function fetchMetalPrices() {
    const url = `https://metals-api.com/api/latest?access_key=${config.metalsApiKey}&currencies=XAU,XPT,XAG,NICKEL,COPPER`;
    return fetchWithCache(url, metalCache);
}

async function fetchCryptoPrices() {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH&CMC_PRO_API_KEY=${config.cryptoApiKey}`;
    // CMC API usually prefers the key in header, but keeping it in URL if that's what was used.
    // However, the original code had it in URL.
    return fetchWithCache(url, cryptoCache);
}

module.exports = { fetchMetalPrices, fetchCryptoPrices };
