const express = require('express');
const path = require('path');
const { addToken, getAllTokensJSON, getAllTokensETag } = require('./src/tokenmanager');
const { electricFence, rateLimiter } = require('./src/security');
const { fetchMetalPrices, fetchCryptoPrices, getMetalCache, getCryptoCache, isMetalCacheValid, isCryptoCacheValid } = require('./src/api');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

/**
 * Robust RFC 7232-compliant check for If-None-Match headers.
 * ⚡ Bolt Optimization: Fast path that avoids regex and .trim() calls.
 */
function isETagMatch(reqHeader, etag) {
    if (!reqHeader) return false;
    if (reqHeader === etag) return true;

    const cleanHeader = reqHeader.startsWith('W/') ? reqHeader.slice(2) : reqHeader;
    const cleanETag = etag.startsWith('W/') ? etag.slice(2) : etag;

    if (cleanHeader === cleanETag) return true;
    return cleanHeader.includes(cleanETag);
}

// 🛡️ Sentinel Security Enhancement: Standard HTTP security headers for defense-in-depth.
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline'; connect-src 'self'");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Robots.txt / SEO
// ⚡ Bolt Optimization: Static file handlers placed BEFORE express.json() & electricFence
// to allow static GET requests to bypass payload parsing and recursive security scans.
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Disallow: /api/
# Integrated Services for VersoriumX and Travis Jerome Goff
# Visit: https://github.com/VersoriumX
# Credits to Travis Jerome Goff and the VersoriumX Team
`);
});

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use('/api', rateLimiter); // Protect backend API endpoints
app.use(express.json());
app.use(electricFence);

// API for Tokens
/**
 * ⚡ Bolt Optimization:
 * Serving pre-serialized JSON string and pre-calculated ETag with RFC 7232 conditional GET support.
 * Bypasses O(n) array mapping and JSON serialization on every request.
 */
app.get('/api/tokens', (req, res) => {
    try {
        const etag = getAllTokensETag();

        if (isETagMatch(req.headers['if-none-match'], etag)) {
            return res.set('ETag', etag).status(304).end();
        }

        res.set({
            'Content-Type': 'application/json',
            'ETag': etag
        }).send(getAllTokensJSON());
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Failed to load tokens' });
    }
});

app.post('/api/tokens', async (req, res) => {
    const { name, value } = req.body || {};
    try {
        if (!name || value === undefined) {
            return res.status(400).json({ error: 'Name and value are required' });
        }
        await addToken(name, value);
        res.status(201).json({ message: 'Token added successfully' });
    } catch (error) {
        console.error('Error adding token:', error);
        res.status(400).json({ error: error.message });
    }
});

// API for Prices
/**
 * ⚡ Bolt Optimization:
 * Fast-path synchronous cache validity check to bypass promise scheduling.
 * Serves pre-serialized JSON and pre-calculated ETag with 304 Not Modified support.
 */
app.get('/api/prices/metals', async (req, res) => {
    try {
        if (isMetalCacheValid()) {
            const cache = getMetalCache();
            if (isETagMatch(req.headers['if-none-match'], cache.etag)) {
                return res.set('ETag', cache.etag).status(304).end();
            }
            return res.set({
                'Content-Type': 'application/json',
                'ETag': cache.etag
            }).send(cache.json);
        }

        await fetchMetalPrices();
        const cache = getMetalCache();

        if (isETagMatch(req.headers['if-none-match'], cache.etag)) {
            return res.set('ETag', cache.etag).status(304).end();
        }

        res.set({
            'Content-Type': 'application/json',
            'ETag': cache.etag
        }).send(cache.json);
    } catch (err) {
        console.error('Error fetching metal prices:', err);
        res.status(500).json({ error: 'Failed to fetch metal prices' });
    }
});

app.get('/api/prices/crypto', async (req, res) => {
    try {
        if (isCryptoCacheValid()) {
            const cache = getCryptoCache();
            if (isETagMatch(req.headers['if-none-match'], cache.etag)) {
                return res.set('ETag', cache.etag).status(304).end();
            }
            return res.set({
                'Content-Type': 'application/json',
                'ETag': cache.etag
            }).send(cache.json);
        }

        await fetchCryptoPrices();
        const cache = getCryptoCache();

        if (isETagMatch(req.headers['if-none-match'], cache.etag)) {
            return res.set('ETag', cache.etag).status(304).end();
        }

        res.set({
            'Content-Type': 'application/json',
            'ETag': cache.etag
        }).send(cache.json);
    } catch (err) {
        console.error('Error fetching crypto prices:', err);
        res.status(500).json({ error: 'Failed to fetch crypto prices' });
    }
});

// Default fallback for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// 🛡️ Sentinel Security Enhancement: Global error handling middleware.
// Intercepts malformed payloads/syntax errors to avoid exposing internal stack traces.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
