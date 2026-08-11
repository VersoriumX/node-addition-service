const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { rateLimiter, ipRequestCounts } = require('../src/security');

describe('Rate Limiter Middleware', () => {
    beforeEach(() => {
        ipRequestCounts.clear();
    });

    it('should allow requests below the limit and set rate-limiting headers', (done) => {
        const req = { ip: '1.1.1.1' };
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
            done();
        };

        rateLimiter(req, res, next);
    });

    it('should enforce the limit and return 429 when exceeded', () => {
        const req = { ip: '2.2.2.2' };
        const res = {
            setHeader: () => {},
            status: (code) => {
                expect(code).to.equal(429);
                return res;
            },
            json: (payload) => {
                expect(payload.error).to.contain('Too many requests');
            }
        };

        // Trigger limit exceeding (limit is 100)
        for (let i = 0; i < 100; i++) {
            rateLimiter(req, res, () => {});
        }

        let nextCalled = false;
        rateLimiter(req, res, () => {
            nextCalled = true;
        });

        expect(nextCalled).to.be.false;
    });

    it('should prune stale entries when the map size exceeds 2000', () => {
        const now = Date.now();
        // Populate the map with 2005 entries, some stale and some fresh
        for (let i = 0; i < 2005; i++) {
            const stale = i < 1000;
            ipRequestCounts.set(`ip-${i}`, {
                count: 1,
                resetTime: stale ? now - 1000 : now + 60000
            });
        }

        expect(ipRequestCounts.size).to.equal(2005);

        // Make one more request to trigger pruning
        const req = { ip: 'trigger-ip' };
        const res = { setHeader: () => {} };
        rateLimiter(req, res, () => {});

        // Stale entries (1000 of them) should be deleted
        expect(ipRequestCounts.size).to.be.lessThan(2005);
        expect(ipRequestCounts.has('ip-0')).to.be.false; // stale ip-0 should be deleted
        expect(ipRequestCounts.has('ip-1500')).to.be.true; // fresh ip-1500 should remain
    });
});
