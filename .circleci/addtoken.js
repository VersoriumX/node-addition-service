// addTokens.js
const tokens = {};

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    tokens[name] = value;
}

function getTokenValue(name) {
    return tokens[name] || null;
}

module.exports = { addToken, getTokenValue };
