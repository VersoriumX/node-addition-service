const express = require('express');
const path = require('path');
const { addToken, getAllTokens } = require('./src/tokenmanager');
const { electricFence } = require('./src/security');
const { fetchMetalPrices, fetchCryptoPrices } = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(electricFence);
app.use(express.static(path.join(__dirname, 'public')));

// API for Tokens
app.get('/api/tokens', (req, res) => {
    try {
        const tokens = getAllTokens();
        const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
        res.json(tokenArray);
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Failed to load tokens' });
    }
});

app.post('/api/tokens', async (req, res) => {
    const { name, value } = req.body;
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
app.get('/api/prices/metals', async (req, res) => {
    try {
        const prices = await fetchMetalPrices();
        res.json(prices);
    } catch (err) {
        console.error('Error fetching metal prices:', err);
        res.status(500).json({ error: 'Failed to fetch metal prices' });
    }
});

app.get('/api/prices/crypto', async (req, res) => {
    try {
        const prices = await fetchCryptoPrices();
        res.json(prices);
    } catch (err) {
        console.error('Error fetching crypto prices:', err);
        res.status(500).json({ error: 'Failed to fetch crypto prices' });
    }
});

// Robots.txt / SEO
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Disallow: /api/
# Integrated Services for VersoriumX and Travis Jerome Goff
# Visit: https://github.com/VersoriumX
# Credits to Travis Jerome Goff and the VersoriumX Team
`);
});

// Default fallback for API routes
app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
