const { describe, it } = require('mocha');
const { expect } = require('chai');
const { addToken, getTokenValue, updateToken, deleteToken } = require('../src/tokenmanager');

describe('Token Manager', () => {
    it('should add a token', () => {
        addToken('TestToken', 100);
        expect(getTokenValue('TestToken')).to.equal(100);
    });

    it('should update a token', () => {
        updateToken('TestToken', 200);
        expect(getTokenValue('TestToken')).to.equal(200);
    });

    it('should delete a token', () => {
        deleteToken('TestToken');
        expect(getTokenValue('TestToken')).to.be.null;
    });

    it('should reject a token name longer than 100 characters', () => {
        const longName = 'a'.repeat(101);
        expect(() => addToken(longName, 100)).to.throw('Invalid token name or value');
    });

    it('should validate token name characters and reject malicious/special characters', () => {
        expect(() => addToken('<script>alert(1)</script>', 100)).to.throw('Invalid token name or value');
        expect(() => addToken('token@name', 100)).to.throw('Invalid token name or value');
        expect(() => addToken('token%name', 100)).to.throw('Invalid token name or value');
        expect(() => addToken('token*name', 100)).to.throw('Invalid token name or value');
    });

    it('should allow valid token names containing spaces, dots, underscores, dashes, and alphanumeric characters', () => {
        addToken('Valid Name 1.0_with-dashes', 100);
        expect(getTokenValue('Valid Name 1.0_with-dashes')).to.equal(100);
        deleteToken('Valid Name 1.0_with-dashes');
    });

    it('should reject non-finite values in addToken', () => {
        expect(() => addToken('FiniteCheck', NaN)).to.throw('Invalid token name or value');
        expect(() => addToken('FiniteCheck', Infinity)).to.throw('Invalid token name or value');
        expect(() => addToken('FiniteCheck', -Infinity)).to.throw('Invalid token name or value');
    });

    it('should reject non-finite values in updateToken', () => {
        addToken('UpdateFiniteCheck', 123);
        expect(() => updateToken('UpdateFiniteCheck', NaN)).to.throw('Invalid token value');
        expect(() => updateToken('UpdateFiniteCheck', Infinity)).to.throw('Invalid token value');
        expect(() => updateToken('UpdateFiniteCheck', -Infinity)).to.throw('Invalid token value');
        deleteToken('UpdateFiniteCheck');
    });

    it('should reject token names with invalid characters', () => {
        expect(() => addToken('Token<script>', 100)).to.throw('Invalid token name: contains invalid characters');
        expect(() => addToken('Token; DROP TABLE', 100)).to.throw('Invalid token name: contains invalid characters');
        expect(() => addToken('Token%', 100)).to.throw('Invalid token name: contains invalid characters');
    });

    it('should reject non-string or long names in updateToken and deleteToken', () => {
        const longName = 'a'.repeat(101);
        expect(() => updateToken(longName, 100)).to.throw('Invalid token name');
        expect(() => updateToken(12345, 100)).to.throw('Invalid token name');
        expect(() => deleteToken(longName)).to.throw('Invalid token name');
        expect(() => deleteToken(12345)).to.throw('Invalid token name');
    });
});
