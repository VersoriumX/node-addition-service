// server.js
const express = require('express');
const path = require('path');
const { addToken, getTokenValue } = require('./src/tokenManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public
