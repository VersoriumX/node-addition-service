document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsList = document.getElementById('searchResults');
    const walletButton = document.getElementById('walletButton');
    const walletAddressDisplay = document.getElementById('walletAddress');
    const metalCtx = document.getElementById('metalChart').getContext('2d');

    const metalChart = initMetalChart(metalCtx);

    // Search functionality
    searchInput.addEventListener('input', async (event) => {
        const query = event.target.value.toLowerCase();
        if (!query) {
            resultsList.innerHTML = '';
            return;
        }
        const response = await fetch('/api/tokens');
        const tokens = await response.json();
        const results = tokens.filter(token => token.name.toLowerCase().includes(query));

        resultsList.innerHTML = '';
        results.forEach(token => {
            const li = document.createElement('li');
            li.textContent = `${token.name}: $${token.value}`;
            resultsList.appendChild(li);
        });
    });

    // Wallet connection
    walletButton.addEventListener('click', async () => {
        const address = await connectWallet();
        if (address) {
            walletAddressDisplay.textContent = `Connected: ${address}`;
            walletButton.textContent = 'Wallet Connected';
        }
    });

    // Price updates
    async function fetchAndUpdatePrices() {
        try {
            const response = await fetch('/api/prices/metals');
            const data = await response.json();
            if (data.rates) {
                updateChart(metalChart, data.rates);
            }
        } catch (error) {
            console.error('Error fetching prices:', error);
        }
    }

    setInterval(fetchAndUpdatePrices, 10000); // Update every 10 seconds
    fetchAndUpdatePrices();
});
