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
