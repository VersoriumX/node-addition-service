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

// ⚡ Bolt Optimization: Private, size-limited, and TTL-backed decryption cache.
// Caching deterministic RSA decryption results avoids expensive CPU modular exponentiation.
const decryptionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms
const MAX_CACHE_SIZE = 1000;

function decrypt(encryptedText) {
    if (typeof encryptedText !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (encryptedText.length > 500) {
        throw new RangeError('Input length must not exceed 500 characters');
    }

    const now = Date.now();
    const cached = decryptionCache.get(encryptedText);
    if (cached) {
        if (now < cached.expiresAt) {
            return cached.value;
        }
        decryptionCache.delete(encryptedText);
    }

    const decrypted = getKey().decrypt(encryptedText, 'utf8');

    // Manage cache size and eviction
    if (decryptionCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = decryptionCache.keys().next().value;
        decryptionCache.delete(oldestKey);
    }

    decryptionCache.set(encryptedText, {
        value: decrypted,
        expiresAt: now + CACHE_TTL
    });

    return decrypted;
}

module.exports = { generateKeys, encrypt, decrypt };
