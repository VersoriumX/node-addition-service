const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

/**
 * ⚡ Bolt Performance Optimization:
 * Utilize lazy initialization for the 2048-bit RSA key instance.
 * Deferring key generation (which takes ~40-80ms+) avoids blocking the event loop on startup
 * and reduces application boot time, especially under heavy module require trees.
 *
 * 🛡️ Sentinel Security Enhancement:
 * Increased RSA key size to 2048 bits to meet modern security standards (NIST).
 * 512-bit keys are considered insecure and susceptible to factoring attacks.
 */
let key = null;

function getKey() {
    if (!key) {
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
    return getKey().encrypt(text, 'base64');
}

function decrypt(encryptedText) {
    return getKey().decrypt(encryptedText, 'utf8');
}

module.exports = { generateKeys, encrypt, decrypt };
