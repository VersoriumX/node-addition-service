// tokenManager.js
const { loadTokens, saveTokens } = require('./database');

let tokens = loadTokens();

/**
 * ⚡ Bolt Optimization:
 * Modification functions now return a promise from the persistence layer.
 * Callers can optionally 'await' these to ensure durability, while
 * the in-memory state remains synchronously updated for immediate consistency.
 */

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    tokens[name] = value;
    return saveTokens(tokens);
}

function getTokenValue(name) {
    return tokens[name] || null;
}

function updateToken(name, value) {
    if (tokens[name]) {
        tokens[name] = value;
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

function deleteToken(name) {
    if (tokens[name]) {
        delete tokens[name];
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

module.exports = { addToken, getTokenValue, updateToken, deleteToken };
