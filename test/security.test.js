const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { electricFence, quarantinedIPs } = require('../src/security');

describe('Electric Fence Security Middleware', () => {
    beforeEach(() => {
        quarantinedIPs.clear();
    });

    it('should allow normal requests', (done) => {
        const req = { query: { a: '1', b: '2' }, body: {}, ip: '1.2.3.4' };
        const res = {};
        const next = () => {
            expect(quarantinedIPs.has('1.2.3.4')).to.be.false;
            done();
        };
        electricFence(req, res, next);
    });

    it('should quarantine and block suspicious requests (long string)', () => {
        const longString = 'a'.repeat(1001);
        const req = { query: { a: longString }, body: {}, ip: '6.6.6.6' };
        let statusSet = 0;
        let jsonSent = null;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: (m) => { jsonSent = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        expect(jsonSent.error).to.contain('Security Violation');
        expect(quarantinedIPs.has('6.6.6.6')).to.be.true;
    });

    it('should quarantine and block suspicious requests (globstar pattern)', () => {
        const suspiciousPattern = '**/**/**';
        const req = { query: { path: suspiciousPattern }, body: {}, ip: '7.7.7.7' };
        let statusSet = 0;
        let jsonSent = null;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: (m) => { jsonSent = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        expect(jsonSent.error).to.contain('Security Violation');
        expect(quarantinedIPs.has('7.7.7.7')).to.be.true;
    });

    it('should continue to block quarantined IPs', () => {
        quarantinedIPs.add('9.9.9.9');
        const req = { query: { a: '1' }, body: {}, ip: '9.9.9.9' };
        let statusSet = 0;
        let jsonSent = null;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: (m) => { jsonSent = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        expect(jsonSent.error).to.contain('Access Denied');
    });

    it('should block suspicious requests in nested objects', () => {
        const req = {
            query: {},
            body: {
                metadata: {
                    search: {
                        pattern: '**/**/**'
                    }
                }
            },
            ip: '8.8.8.8'
        };
        let statusSet = 0;
        let jsonSent = null;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: (m) => { jsonSent = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        expect(jsonSent.error).to.contain('Security Violation');
        expect(quarantinedIPs.has('8.8.8.8')).to.be.true;
    });
});
