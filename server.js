// server.js
const express = require('express');
const path = require('path');
const { addToken, getTokenValue, updateToken, deleteToken } = require('./src/tokenmanager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API for Tokens
app.get('/api/tokens', (req, res) => {
    // In a real app, we might want to list all tokens.
    // For now, let's return a sample or the whole DB if possible.
    // Since loadTokens is in database.js, and tokenmanager uses it.
    const { loadTokens } = require('./src/database');
    res.json(loadTokens());
});

app.post('/api/tokens', (req, res) => {
    const { name, value } = req.body;
    try {
        addToken(name, value);
        res.status(201).json({ message: 'Token added successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API for Prices
app.get('/api/prices/metals', async (req, res) => {
    try {
        const prices = await fetchMetalPrices();
        res.json(prices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/prices/crypto', async (req, res) => {
    try {
        const prices = await fetchCryptoPrices();
        res.json(prices);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
