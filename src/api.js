// api.js
const fetch = require('node-fetch');
const config = require('./config');

async function fetchMetalPrices() {
    const response = await fetch(`https://metals-api.com/api/latest?access_key=${config.metalsApiKey}&currencies=XAU,XPT,XAG,NICKEL,COPPER`);
    return response.json();
}

async function fetchCryptoPrices() {
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH&CMC_PRO_API_KEY=${config.cryptoApiKey}`);
    return response.json();
}

module.exports = { fetchMetalPrices, fetchCryptoPrices };
