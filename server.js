const express = require('express');
const path = require('path');
const { addToken, getTokenValue, getAllTokens } = require('./src/tokenmanager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API route to get all tokens
app.get('/api/tokens', (req, res) => {
    const tokens = getAllTokens();
    const tokenList = Object.keys(tokens).map(name => ({
        name: name,
        value: tokens[name]
    }));
    res.json(tokenList);
});

// API route to get prices from external APIs
app.get('/api/prices/metals', async (req, res) => {
    try {
        const prices = await fetchMetalPrices();
        res.json(prices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metal prices' });
    }
});

app.get('/api/prices/crypto', async (req, res) => {
    try {
        const prices = await fetchCryptoPrices();
        res.json(prices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch crypto prices' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
