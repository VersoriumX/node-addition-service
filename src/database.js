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

let isSaving = false;
let needsSave = false;
let currentTokens = null;

/**
 * Saves tokens to the database file asynchronously.
 * Uses a lock and a 'needsSave' flag to ensure that if multiple updates happen
 * while a write is in progress, the final state is always persisted.
 */
function saveTokens(tokens) {
    currentTokens = tokens;
    if (isSaving) {
        needsSave = true;
        return;
    }

    isSaving = true;
    needsSave = false;

    fs.writeFile(dbPath, JSON.stringify(currentTokens, null, 2), (err) => {
        isSaving = false;
        if (err) {
            console.error('Failed to save tokens:', err);
        }
        // If an update occurred while we were writing, trigger another save
        if (needsSave) {
            saveTokens(currentTokens);
        }
    });
}

module.exports = { loadTokens, saveTokens };
