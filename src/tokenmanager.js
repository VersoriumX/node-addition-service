const { loadTokens, saveTokens } = require('./database');

/**
 * 🛡️ Sentinel Security Enhancement:
 * Use a null-prototype object to prevent prototype pollution and
 * unauthorized access to inherited properties (e.g., 'constructor').
 */
let tokens = Object.assign(Object.create(null), loadTokens());

const SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    tokens[name] = value;
    return saveTokens(tokens);
}

function getTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    // Null-prototype object prevents access to inherited properties
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getAllTokens() {
    return tokens;
}

function updateToken(name, value) {
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    if (tokens[name] !== undefined) {
        if (typeof value !== 'number') {
            throw new Error('Invalid token value');
        }
        tokens[name] = value;
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

function deleteToken(name) {
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    if (tokens[name] !== undefined) {
        delete tokens[name];
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

module.exports = { addToken, getTokenValue, getAllTokens, updateToken, deleteToken };
