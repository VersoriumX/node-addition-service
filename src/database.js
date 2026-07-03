// database.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'tokens.json');

function loadTokens() {
    if (fs.existsSync(dbPath)) {
        try {
            const data = fs.readFileSync(dbPath);
            return JSON.parse(data);
        } catch (err) {
            console.error('Error loading tokens:', err);
        }
    }
    return {};
}

/**
 * ⚡ Bolt Optimization:
 * A write queue ensures that file writes are performed sequentially.
 * This prevents race conditions and data corruption that can occur
 * when multiple asynchronous writes happen concurrently.
 */
let isWriting = false;
let nextData = null;
let currentPromise = null;
let currentResolve = null;
let currentReject = null;

async function saveTokens(tokens) {
    // If a write is already in progress, store the latest data
    if (isWriting) {
        nextData = tokens;
        // Return a promise that will resolve when the queued write completes
        if (!currentPromise) {
            currentPromise = new Promise((resolve, reject) => {
                currentResolve = resolve;
                currentReject = reject;
            });
        }
        return currentPromise;
    }

    isWriting = true;
    try {
        await fs.promises.writeFile(dbPath, JSON.stringify(tokens, null, 2));
    } catch (err) {
        console.error('Error saving tokens:', err);
        throw err;
    } finally {
        isWriting = false;

        // If there is queued data, process it now
        if (nextData) {
            const dataToSave = nextData;
            const resolve = currentResolve;
            const reject = currentReject;

            nextData = null;
            currentPromise = null;
            currentResolve = null;
            currentReject = null;

            try {
                await saveTokens(dataToSave);
                if (resolve) resolve();
            } catch (err) {
                if (reject) reject(err);
            }
        }
    }
}

module.exports = { loadTokens, saveTokens };
