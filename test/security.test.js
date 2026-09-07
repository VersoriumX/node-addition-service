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
            expect(headers['Content-Security-Policy']).to.contain("'unsafe-inline'");
            expect(headers['Content-Security-Policy']).to.contain("connect-src 'self'");
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

    it('should quarantine and block suspicious requests with malicious payload in req.params', () => {
        const suspiciousPattern = '**/**/**';
        const req = { query: {}, body: {}, params: { id: suspiciousPattern }, ip: '11.11.11.11' };
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
        expect(quarantinedIPs.has('11.11.11.11')).to.be.true;
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

    it('should not quarantine or block the unknown/undefined IP address', () => {
        const suspiciousPattern = '**/**/**';
        const req = { query: { path: suspiciousPattern }, body: {}, ip: undefined };
        let statusSet = 0;
        let jsonSent = null;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: (m) => { jsonSent = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        expect(quarantinedIPs.has('unknown')).to.be.false;
        expect(quarantinedIPs.has(undefined)).to.be.false;

        // Ensure that a subsequent normal request with undefined ip is not blocked
        const cleanReq = { query: { a: '1' }, body: {}, ip: undefined };
        let cleanNextCalled = false;
        const cleanRes = { setHeader: () => {} };
        electricFence(cleanReq, cleanRes, () => { cleanNextCalled = true; });
        expect(cleanNextCalled).to.be.true;
    });

    it('should limit quarantinedIPs size to 1000 and evict oldest via FIFO', () => {
        // Pre-fill quarantinedIPs to the limit
        for (let i = 0; i < 1000; i++) {
            quarantinedIPs.add(`192.168.1.${i}`);
        }
        expect(quarantinedIPs.size).to.equal(1000);

        // First added is 192.168.1.0, should be the oldest
        expect(quarantinedIPs.has('192.168.1.0')).to.be.true;

        // Trigger a quarantine for a new IP '172.16.0.1'
        const suspiciousPattern = '**/**/**';
        const req = { query: { path: suspiciousPattern }, body: {}, ip: '172.16.0.1' };
        let statusSet = 0;
        const res = {
            status: (s) => { statusSet = s; return res; },
            json: () => {}
        };
        const next = () => { throw new Error('Next should not be called'); };

        electricFence(req, res, next);

        expect(statusSet).to.equal(403);
        // The size should still be 1000
        expect(quarantinedIPs.size).to.equal(1000);
        // The new IP should be quarantined
        expect(quarantinedIPs.has('172.16.0.1')).to.be.true;
        // The oldest IP '192.168.1.0' should have been evicted
        expect(quarantinedIPs.has('192.168.1.0')).to.be.false;
        // The second oldest '192.168.1.1' should still exist
        expect(quarantinedIPs.has('192.168.1.1')).to.be.true;
    });
});
