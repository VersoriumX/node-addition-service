const assert = require('assert');
const { addToken, getTokenValue, getAllTokens } = require('../src/tokenmanager');
const fs = require('fs');
const path = require('path');

describe('VersoriumX Framework - Token Manager', () => {
    const testDbPath = path.join(__dirname, '../src/tokens.json');

    it('should add a new token', () => {
        addToken('TestToken', 500);
        assert.strictEqual(getTokenValue('TestToken'), 500);
    });

    it('should retrieve all tokens', () => {
        const tokens = getAllTokens();
        assert.ok(tokens.hasOwnProperty('TestToken'));
    });

    it('should update an existing token', () => {
        const { updateToken } = require('../src/tokenmanager');
        updateToken('TestToken', 600);
        assert.strictEqual(getTokenValue('TestToken'), 600);
    });

    it('should delete a token', () => {
        const { deleteToken } = require('../src/tokenmanager');
        deleteToken('TestToken');
        assert.strictEqual(getTokenValue('TestToken'), null);
    });
});
