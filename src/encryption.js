const NodeRSA = require('node-rsa');
const RSA = NodeRSA.NodeRSA || NodeRSA;

const key = new RSA({ b: 512 }); // Small key for demo purposes

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
