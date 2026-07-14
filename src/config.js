// config.js
const config = {
    /**
     * 🛡️ Sentinel Security Enhancement:
     * Use environment variables for sensitive API keys to avoid hardcoding secrets in the codebase.
     * Fallbacks are provided for local development only.
     */
    metalsApiKey: process.env.METALS_API_KEY || 'YOUR_METALS_API_KEY',
    cryptoApiKey: process.env.CRYPTO_API_KEY || 'YOUR_CRYPTO_API_KEY',
    // Add other configuration settings as needed
};

module.exports = config;
