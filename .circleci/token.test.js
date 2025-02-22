// addTokens.test.js
const { describe, it } = require('mocha');
const { expect } = require('chai');

const { addToken, getTokenValue } = require('./addTokens');

describe('Custom Crypto Tokens', () => {
    describe('Adding tokens', () => {
        it('should add a token with a valid name and value', () => {
            addToken('EthereumX', 2000);
            expect(getTokenValue('EthereumX')).to.equal(2000);
        });

        it('should throw an error for invalid token name', () => {
            expect(() => addToken(123, 2000)).to.throw('Invalid token name or value');
        });

        it('should throw an error for invalid token value', () => {
            expect(() => addToken('EthereumX', 'two thousand')).to.throw('Invalid token name or value');
        });
    });

    describe('Retrieving token values', () => {
        it('should return the correct value for an existing token', () => {
            addToken('BitcoinX', 50000);
            expect(getTokenValue('BitcoinX')).to.equal(50000);
        });

        it('should return null for a non-existing token', () => {
            expect(getTokenValue('NonExistentToken')).to.be.null;
        });
    });
});
