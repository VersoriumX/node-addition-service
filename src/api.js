const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const crypto = require('crypto');
const config = require('./config');

const CACHE_DURATION = 60 * 1000; // 1 minute cache
let metalCache = { data: null, json: null, etag: null, timestamp: 0 };
let cryptoCache = { data: null, json: null, etag: null, timestamp: 0 };

/**
 * ⚡ Bolt Optimization: Request Coalescing (Promise Memoization)
 * This Map stores in-flight promises for specific URLs to prevent the "Thundering Herd" problem.
 */
const pendingPromises = new Map();

async function fetchWithCache(url, cache, headers = {}) {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
        return cache;
    }

    if (pendingPromises.has(url)) {
        return pendingPromises.get(url);
    }

    const fetchPromise = (async () => {
        try {
            // 🛡️ Sentinel Security Enhancement: Enforce HTTP request timeout using AbortSignal.timeout
            // node-fetch v3 ignores legacy 'timeout' option, requiring signal to prevent hanging requests and DoS
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // ⚡ Bolt Optimization: Pre-calculate JSON and ETag to avoid O(n) overhead on every request
            const json = JSON.stringify(data);
            const etag = `"${crypto.createHash('md5').update(json).digest('hex')}"`;

            cache.data = data;
            cache.json = json;
            cache.etag = etag;
            cache.timestamp = Date.now();
            return cache;
        } catch (error) {
            const redactedUrl = url.replace(/(access_key|CMC_PRO_API_KEY)=[^&]+/g, '$1=[REDACTED]');
            const redactedMsg = error && error.message ? error.message.replace(/(access_key|CMC_PRO_API_KEY)=[^&]+/g, '$1=[REDACTED]') : error;
            console.error(`Error fetching from ${redactedUrl}: ${redactedMsg}`);

            if (cache.data) return cache;
            throw error;
        } finally {
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

function isMetalCacheValid() {
    return !!(metalCache.data && (Date.now() - metalCache.timestamp < CACHE_DURATION));
}

function isCryptoCacheValid() {
    return !!(cryptoCache.data && (Date.now() - cryptoCache.timestamp < CACHE_DURATION));
}

module.exports = {
    fetchMetalPrices,
    fetchCryptoPrices,
    getMetalCache: () => metalCache,
    getCryptoCache: () => cryptoCache,
    isMetalCacheValid,
    isCryptoCacheValid
};
