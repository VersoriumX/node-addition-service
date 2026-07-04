const express = require('express');
const path = require('path');
const add = require('./add');
const { securityMiddleware } = require('./src/security');
const { addToken, getTokenValue, getAllTokens } = require('./src/tokenmanager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./src/api');
const { encrypt, decrypt, generateKeys } = require('./src/encryption');
const { generateVariations } = require('./src/fuzzer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Apply security middleware to all routes
app.use(securityMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

// Original legacy route
app.get('/add', (req, res) => {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  res.send(`Hello World!: ${add(a, b)}`);
});

// Integrated Mesh APIs
app.get('/api/tokens', (req, res) => {
    // ⚡ Bolt Optimization: Using getAllTokens() which returns the memory-cached tokens
    // instead of loadTokens() which performs expensive disk I/O.
    const tokens = getAllTokens();

    // Maintain backward compatibility with the expected format (object or array)
    // Based on VersoriumX.html, it expects an array of { name, value }.
    // Based on potential other consumers, it might expect the raw object from database.js

    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    res.json(tokenArray);
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
  console.log(`Mesh Service listening at http://localhost:${port}`);
});
