const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

let _key = null;

function getKey() {
    if (!_key) {
        // ⚡ Bolt Optimization: Lazy-initialize the 2048-bit RSA key instance.
        // This defers the expensive CPU key generation overhead (~50-100ms)
        // from module load/startup time until the first actual cryptographic call,
        // reducing application startup latency significantly.
        _key = new RSA({ b: 2048 });
    }
    return _key;
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
