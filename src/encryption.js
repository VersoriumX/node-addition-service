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

function decrypt(encryptedText) {
    if (typeof encryptedText !== 'string') {
        throw new TypeError('Input must be a string');
    }
    // 🛡️ Sentinel Security Enhancement:
    // Limit decryption payload length to 500 characters to protect against CPU/Memory resource exhaustion (DoS) attacks.
    if (encryptedText.length > 500) {
        throw new RangeError('Input length must not exceed 500 characters');
    }
    return getKey().decrypt(encryptedText, 'utf8');
}

module.exports = { generateKeys, encrypt, decrypt };
