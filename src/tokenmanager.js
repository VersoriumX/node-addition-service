// tokenManager.js
const { loadTokens, saveTokens } = require('./database');

let tokens = loadTokens();

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    tokens[name] = value;
    saveTokens(tokens);
}

function getTokenValue(name) {
    return tokens[name] || null;
}

function updateToken(name, value) {
    if (tokens[name]) {
        tokens[name] = value;
        saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

function deleteToken(name) {
    if (tokens[name]) {
        delete tokens[name];
        saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

module.exports = { addToken, getTokenValue, updateToken, deleteToken };
