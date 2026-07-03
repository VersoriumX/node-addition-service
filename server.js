// server.js
const express = require('express');
const path = require('path');
const { addToken, getTokenValue } = require('./src/tokenManager');
const { securityMiddleware } = require('./src/security');

const app = express();

// Apply security middleware to all routes
app.use(securityMiddleware);
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tokens', (req, res) => {
    // Assuming the tokenManager stores tokens in an object
    // and we want to return them as an array for the frontend
    const { loadTokens } = require('./src/database');
    const tokens = loadTokens();
    const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
    res.json(tokenArray);
});

app.get('/api/token', (req, res) => {
    const name = req.query.name;
    const value = getTokenValue(name);
    if (value !== null) {
        res.json({ name, value });
    } else {
        res.status(404).json({ error: 'Token not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
