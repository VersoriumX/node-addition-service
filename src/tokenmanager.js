const crypto = require('crypto');
const { loadTokens, saveTokens } = require('./database');

/**
 * 🛡️ Sentinel Security Enhancement:
 * Use a null-prototype object to prevent prototype pollution and
 * unauthorized access to inherited properties (e.g., 'constructor').
 */
let tokens = Object.assign(Object.create(null), loadTokens());

/**
 * ⚡ Bolt Optimization:
 * In-memory cache for tokens in array format and JSON string to avoid
 * repeated O(n) mapping and serialization on every API request.
 */
let tokensArrayCache = null;
let tokensJSONCache = null;
let tokensETagCache = null;

function updateCache() {
    const arr = Object.keys(tokens).map(name => Object.freeze({ name, value: tokens[name] }));
    tokensArrayCache = Object.freeze(arr);
    tokensJSONCache = JSON.stringify(arr);
    // ⚡ Bolt Optimization: Pre-calculate ETag to avoid hashing on every request.
    // We use MD5 as it is fast and sufficient for ETag purposes.
    tokensETagCache = `"${crypto.createHash('md5').update(tokensJSONCache).digest('hex')}"`;
}

// Initial cache population
updateCache();

const SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    if (SENSITIVE_KEYS.includes(name)) {
        throw new Error('Invalid token name: sensitive key');
    }
    tokens[name] = value;
    updateCache();
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

/**
 * ⚡ Bolt Optimization:
 * Returns the memory-cached array of tokens.
 */
function getAllTokensArray() {
    if (!tokensArrayCache) updateCache();
    return tokensArrayCache;
}

/**
 * ⚡ Bolt Optimization:
 * Returns the pre-serialized JSON string of the tokens array.
 */
function getAllTokensJSON() {
    if (tokensJSONCache === null) updateCache();
    return tokensJSONCache;
}

/**
 * ⚡ Bolt Optimization:
 * Returns the pre-calculated ETag for the tokens JSON.
 */
function getAllTokensETag() {
    if (tokensETagCache === null) updateCache();
    return tokensETagCache;
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
        updateCache();
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
        updateCache();
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

module.exports = { addToken, getTokenValue, getAllTokens, getAllTokensArray, getAllTokensJSON, getAllTokensETag, updateToken, deleteToken };
