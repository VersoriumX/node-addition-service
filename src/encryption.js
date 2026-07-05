const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

/**
 * 🛡️ Sentinel Security Enhancement:
 * Increased RSA key size to 2048 bits to meet modern security standards (NIST).
 * 512-bit keys are considered insecure and susceptible to factoring attacks.
 */
const key = new RSA({ b: 2048 });

function generateKeys() {
    return {
        public: key.exportKey('public'),
        private: key.exportKey('private')
    };
}

function encrypt(text) {
    return key.encrypt(text, 'base64');
}

function decrypt(encryptedText) {
    return key.decrypt(encryptedText, 'utf8');
}

module.exports = { generateKeys, encrypt, decrypt };
