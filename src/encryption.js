const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

/**
 * ⚡ Bolt Optimization:
 * Defer the expensive CPU key generation overhead (~80ms+) from module load/startup time
 * until the first actual cryptographic call by using lazy initialization.
 * This improves startup latency significantly.
 */
let key = null;

function getKey() {
    if (!key) {
        // 🛡️ Sentinel Security Enhancement:
        // Increased RSA key size to 2048 bits to meet modern security standards (NIST).
        // 512-bit keys are considered insecure and susceptible to factoring attacks.
        key = new RSA({ b: 2048 });
    }
    return key;
}

function generateKeys() {
    const k = getKey();
    return {
        public: k.exportKey('public'),
        private: k.exportKey('private')
    };
}

function encrypt(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (text.length > 245) {
        throw new RangeError('Input length must not exceed 245 characters');
    }
    return getKey().encrypt(text, 'base64');
}

// ⚡ Bolt Optimization: Private Decryption Cache to store deterministic RSA decryption results.
// Size limit (MAX_SIZE = 1000) and TTL (5 minutes) protect against memory bloat.
// Strictly private to module scope to avoid exposing decrypted keys/tokens.
const DECRYPTION_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 1000;

function decrypt(encryptedText) {
    if (typeof encryptedText !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (encryptedText.length > 500) {
        throw new RangeError('Input length must not exceed 500 characters');
    }

    const cached = DECRYPTION_CACHE.get(encryptedText);
    if (cached) {
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.value;
        }
        DECRYPTION_CACHE.delete(encryptedText);
    }

    const decrypted = getKey().decrypt(encryptedText, 'utf8');

    // Handle cache size limit
    if (DECRYPTION_CACHE.size >= CACHE_MAX_SIZE) {
        const oldestKey = DECRYPTION_CACHE.keys().next().value;
        DECRYPTION_CACHE.delete(oldestKey);
    }

    DECRYPTION_CACHE.set(encryptedText, {
        value: decrypted,
        timestamp: Date.now()
    });

    return decrypted;
}

module.exports = { generateKeys, encrypt, decrypt };
