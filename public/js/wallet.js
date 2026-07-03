async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else {
        alert('Please install MetaMask or another Web3 wallet.');
    }
    return null;
}
