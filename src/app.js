// app.js
const { addToken, getTokenValue } = require('./tokenManager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./api');

async function main() {
    // Example usage
    addToken('EthereumX', 2000);
    console.log(getTokenValue('EthereumX')); // 2000

    const metalPrices = await fetchMetalPrices();
    console.log(metalPrices);

    const cryptoPrices = await fetchCryptoPrices();
    console.log(cryptoPrices);
}

main();
