const express = require('express');
const path = require('path');
const add = require('./add');
const { addToken, getTokenValue, getAllTokens } = require('./src/tokenmanager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./src/api');
const { encrypt, decrypt } = require('./src/encryption');
const { generateVariations } = require('./src/fuzzer');
const { electricFence } = require('./src/security');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(electricFence); // Apply Electric Fence Security Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Original legacy route
app.get('/add', (req, res) => {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  res.send(`Hello World!: ${add(a, b)}`);
});

// Integrated Mesh APIs
app.get('/api/tokens', (req, res) => {
    try {
        const tokens = getAllTokens() || {};
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

// Encryption API
app.post('/api/encrypt', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    res.json({ encrypted: encrypt(text) });
});

app.post('/api/decrypt', (req, res) => {
    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ error: 'Encrypted text is required' });
    try {
        res.json({ decrypted: decrypt(encrypted) });
    } catch (err) {
        res.status(400).json({ error: 'Decryption failed' });
    }
});

// Fuzzing API
app.get('/api/fuzz', (req, res) => {
    const { input } = req.query;
    if (!input) return res.status(400).json({ error: 'Input is required' });
    res.json({ variations: generateVariations(input) });
});

// Robots / SEO
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'VersoriumX.html'));
});

app.listen(port, () => {
  console.log(`Mesh Service with Electric Fence listening at http://localhost:${port}`);
});
