const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

/**
 * ⚡ Bolt Optimization:
 * Defer the expensive CPU key generation overhead (~80ms+) from module load/startup time
 * until the first actual cryptographic call by using lazy initialization.
 * This improves startup latency significantly.
 */
let key = null;

/**
 * ⚡ Bolt Optimization:
 * Decryption cache storing deterministic RSA decryption results.
 * Since RSA decryption can be slow (~3ms+), caching results significantly improves
 * subsequent decryption performance of the same inputs.
 * The cache has a maximum size of 1000 items and a 5-minute TTL (Time To Live).
 *
 * 🛡️ Security Note:
 * This cache remains strictly private to the module scope and is never exported,
 * preventing any external modules from inspecting or modifying the cached plaintexts.
 */
const decryptionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

function getKey() {
    if (!key) {
        // 🛡️ Sentinel Security Enhancement:
        // Increased RSA key size to 2048 bits to meet modern security standards (NIST).
        // 512-bit keys are considered insecure and susceptible to factoring attacks.
        key = new RSA({ b: 2048 });
        decryptionCache.clear();
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

function decrypt(encryptedText) {
    if (typeof encryptedText !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (encryptedText.length > 500) {
        throw new RangeError('Input length must not exceed 500 characters');
    }

    const now = Date.now();
    const cached = decryptionCache.get(encryptedText);

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        return cached.value;
    }

    const decrypted = getKey().decrypt(encryptedText, 'utf8');

    // Enforce size limit on cache
    if (decryptionCache.size >= MAX_CACHE_SIZE) {
        // Evict the first/oldest item (FIFO eviction pattern via Map keys iterator)
        const firstKey = decryptionCache.keys().next().value;
        decryptionCache.delete(firstKey);
    }

    decryptionCache.set(encryptedText, {
        value: decrypted,
        timestamp: now
    });

    return decrypted;
}

module.exports = { generateKeys, encrypt, decrypt };
