const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { electricFence, quarantinedIPs, rateLimiter, ipRequestCounts } = require('../src/security');

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

    describe('Rate Limiter Middleware', () => {
        beforeEach(() => {
            ipRequestCounts.clear();
        });

        it('should allow normal requests and set rate limit headers', (done) => {
            const req = { ip: '192.168.1.1' };
            const headers = {};
            const res = {
                setHeader: (key, val) => {
                    headers[key] = val;
                }
            };
            const next = () => {
                expect(headers['X-RateLimit-Limit']).to.equal(100);
                expect(headers['X-RateLimit-Remaining']).to.equal(99);
                expect(headers['X-RateLimit-Reset']).to.exist;
                expect(ipRequestCounts.get('192.168.1.1').count).to.equal(1);
                done();
            };
            rateLimiter(req, res, next);
        });

        it('should return 429 when request limit is exceeded', () => {
            const req = { ip: '192.168.1.2' };
            const headers = {};
            let statusSet = 0;
            let jsonSent = null;
            const res = {
                setHeader: (key, val) => {
                    headers[key] = val;
                },
                status: (s) => {
                    statusSet = s;
                    return res;
                },
                json: (j) => {
                    jsonSent = j;
                }
            };

            // Exceed limit
            for (let i = 0; i < 101; i++) {
                rateLimiter(req, res, () => {});
            }

            expect(statusSet).to.equal(429);
            expect(jsonSent.error).to.contain('Too many requests');
            expect(headers['X-RateLimit-Remaining']).to.equal(0);
        });

        it('should prune stale entries when map grows too large', () => {
            const now = Date.now();
            // Put some stale entry
            ipRequestCounts.set('stale-ip', { count: 1, resetTime: now - 1000 });
            // Put active entries to push size beyond 2000
            for (let i = 0; i < 2005; i++) {
                ipRequestCounts.set(`ip-${i}`, { count: 1, resetTime: now + 60000 });
            }

            const req = { ip: 'trigger-ip' };
            const res = { setHeader: () => {} };
            rateLimiter(req, res, () => {});

            // 'stale-ip' should be pruned because resetTime is in the past
            expect(ipRequestCounts.has('stale-ip')).to.be.false;
            // The newly added IP should be present
            expect(ipRequestCounts.has('trigger-ip')).to.be.true;
        });
    });
});
