// database.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'tokens.json');

function loadTokens() {
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath);
        return JSON.parse(data);
    }
    return {};
}

function saveTokens(tokens) {
    fs.writeFileSync(dbPath, JSON.stringify(tokens, null, 2));
}

module.exports = { loadTokens, saveTokens };
