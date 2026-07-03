const { loadTokens, saveTokens } = require('./database');

let tokens = loadTokens();

function addToken(name, value) {
    if (typeof name !== 'string' || typeof value !== 'number') {
        throw new Error('Invalid token name or value');
    }
    tokens[name] = value;
    return saveTokens(tokens);
}

function getTokenValue(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function getAllTokens() {
    return tokens;
}

function updateToken(name, value) {
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
    if (tokens[name] !== undefined) {
        delete tokens[name];
        return saveTokens(tokens);
    } else {
        throw new Error('Token does not exist');
    }
}

module.exports = { addToken, getTokenValue, getAllTokens, updateToken, deleteToken };
