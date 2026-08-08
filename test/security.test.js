const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { electricFence, quarantinedIPs } = require('../src/security');

describe('Electric Fence Security Middleware', () => {
    beforeEach(() => {
        quarantinedIPs.clear();
    });

    it('should allow normal requests and set security headers if res.setHeader is present', (done) => {
        const req = { query: { a: '1', b: '2' }, body: {}, ip: '1.2.3.4' };
        const headers = {};
        const res = {
            setHeader: (key, val) => {
                headers[key] = val;
            }
        };
        const next = () => {
            expect(quarantinedIPs.has('1.2.3.4')).to.be.false;
            expect(headers['Content-Security-Policy']).to.exist;
            expect(headers['X-Frame-Options']).to.equal('DENY');
            expect(headers['X-Content-Type-Options']).to.equal('nosniff');
            expect(headers['Referrer-Policy']).to.equal('no-referrer');
            expect(headers['X-XSS-Protection']).to.equal('1; mode=block');
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

    it('should quarantine and block suspicious requests with malicious payload in object keys', () => {
        const suspiciousPattern = '**/**/**';
        const req = { query: {}, body: { [suspiciousPattern]: 'safeValue' }, ip: '8.8.8.8' };
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

    it('should allow safe array payloads and block suspicious array elements', () => {
        // Safe array
        const safeReq = { query: {}, body: { items: ['safe1', 'safe2'] }, ip: '1.2.3.4' };
        let nextCalled = false;
        const res = { setHeader: () => {} };
        electricFence(safeReq, res, () => { nextCalled = true; });
        expect(nextCalled).to.be.true;
        expect(quarantinedIPs.has('1.2.3.4')).to.be.false;

        // Suspicious array
        const suspiciousPattern = '**/**/**';
        const suspiciousReq = { query: {}, body: { items: ['safe1', suspiciousPattern] }, ip: '10.10.10.10' };
        let statusSet = 0;
        let jsonSent = null;
        const suspiciousRes = {
            status: (s) => { statusSet = s; return suspiciousRes; },
            json: (m) => { jsonSent = m; }
        };
        const badNext = () => { throw new Error('Next should not be called'); };
        electricFence(suspiciousReq, suspiciousRes, badNext);
        expect(statusSet).to.equal(403);
        expect(quarantinedIPs.has('10.10.10.10')).to.be.true;
    });
});
