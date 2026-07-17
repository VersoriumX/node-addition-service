const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

/**
 * 🛡️ Sentinel Security Enhancement:
 * Increased RSA key size to 2048 bits to meet modern security standards (NIST).
 * 512-bit keys are considered insecure and susceptible to factoring attacks.
 */
let keyInstance = null;

/**
 * ⚡ Bolt Optimization: Lazy Initialization of RSA Key
 * Generating a 2048-bit RSA key dynamically at module load time is an extremely
 * expensive CPU operation (taking ~80ms+) that blocks the event loop on startup.
 * Deferring key generation until it is actually needed allows for faster startup.
 */
function getKey() {
    if (!keyInstance) {
        keyInstance = new RSA({ b: 2048 });
    }
    return keyInstance;
}

function generateKeys() {
    const key = getKey();
    return {
        public: key.exportKey('public'),
        private: key.exportKey('private')
    };
}

function encrypt(text) {
    return getKey().encrypt(text, 'base64');
}

function decrypt(encryptedText) {
    return getKey().decrypt(encryptedText, 'utf8');
}

module.exports = { generateKeys, encrypt, decrypt };
