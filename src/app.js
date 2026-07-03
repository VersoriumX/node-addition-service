const { addToken, getTokenValue } = require('./tokenmanager');
const { fetchMetalPrices, fetchCryptoPrices } = require('./api');

async function main() {
    try {
        // Example usage
        await addToken('EthereumX', 2000);
        console.log('EthereumX Value:', getTokenValue('EthereumX'));

        const metalPrices = await fetchMetalPrices();
        console.log('Metal Prices:', metalPrices);

        const cryptoPrices = await fetchCryptoPrices();
        console.log('Crypto Prices:', cryptoPrices);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
