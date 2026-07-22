const { describe, it } = require('mocha');
const { expect } = require('chai');
const { addToken, getTokenValue, updateToken, deleteToken } = require('../src/tokenmanager');

describe('Token Manager', () => {
    it('should add a token', () => {
        addToken('TestToken', 100);
        expect(getTokenValue('TestToken')).to.equal(100);
    });

    it('should reject extremely long token names', () => {
        const longName = 'A'.repeat(101);
        expect(() => addToken(longName, 100)).to.throw('Token name is too long');
    });

    it('should reject non-finite token values on add', () => {
        expect(() => addToken('FiniteToken', NaN)).to.throw('Invalid token name or value');
        expect(() => addToken('FiniteToken2', Infinity)).to.throw('Invalid token name or value');
    });

    it('should update a token', () => {
        updateToken('TestToken', 200);
        expect(getTokenValue('TestToken')).to.equal(200);
    });

    it('should reject non-finite token values on update', () => {
        expect(() => updateToken('TestToken', NaN)).to.throw('Invalid token value');
        expect(() => updateToken('TestToken', Infinity)).to.throw('Invalid token value');
    });

    it('should delete a token', () => {
        deleteToken('TestToken');
        expect(getTokenValue('TestToken')).to.be.null;
    });
});
