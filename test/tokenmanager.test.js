const assert = require('assert');
const { addToken, getTokenValue, getAllTokens, updateToken, deleteToken } = require('../src/tokenmanager');

describe('Token Manager', () => {
    it('should add and get a token', () => {
        addToken('TestCoin', 100);
        assert.strictEqual(getTokenValue('TestCoin'), 100);
    });

    it('should update a token', () => {
        updateToken('TestCoin', 200);
        assert.strictEqual(getTokenValue('TestCoin'), 200);
    });

    it('should delete a token', () => {
        deleteToken('TestCoin');
        assert.strictEqual(getTokenValue('TestCoin'), null);
    });

    it('should get all tokens', () => {
        addToken('Coin1', 10);
        addToken('Coin2', 20);
        const tokens = getAllTokens();
        assert.strictEqual(tokens['Coin1'], 10);
        assert.strictEqual(tokens['Coin2'], 20);
    });
});
