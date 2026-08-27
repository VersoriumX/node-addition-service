const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { rateLimiter, ipRequestCounts } = require('../src/security');

describe('In-Memory Rate Limiter Middleware', () => {
    beforeEach(() => {
        ipRequestCounts.clear();
    });

    it('should allow requests within limit and set correct headers', (done) => {
        const req = { ip: '1.2.3.4' };
        const headers = {};
        const res = {
            setHeader: (key, val) => {
                headers[key] = val;
            }
        };
        const next = () => {
            expect(headers['X-RateLimit-Limit']).to.equal(100);
            expect(headers['X-RateLimit-Remaining']).to.equal(99);
            expect(headers['X-RateLimit-Reset']).to.be.a('number');
            done();
        };

        rateLimiter(req, res, next);
    });

    it('should decrement remaining requests correctly on multiple requests', (done) => {
        const req = { ip: '1.2.3.4' };
        const headers = {};
        const res = {
            setHeader: (key, val) => {
                headers[key] = val;
            }
        };

        let callCount = 0;
        const next = () => {
            callCount++;
            if (callCount === 5) {
                expect(headers['X-RateLimit-Remaining']).to.equal(95);
                done();
            } else {
                rateLimiter(req, res, next);
            }
        };

        rateLimiter(req, res, next);
    });

    it('should reject requests that exceed the limit with 429 status', () => {
        const req = { ip: '1.2.3.4' };
        const resHeaders = {};
        let statusSet = 0;
        let jsonSent = null;

        const res = {
            setHeader: (key, val) => {
                resHeaders[key] = val;
            },
            status: (s) => {
                statusSet = s;
                return res;
            },
            json: (payload) => {
                jsonSent = payload;
            }
        };

        const next = () => {
            throw new Error('Next should not be called when rate limit is exceeded');
        };

        // Put 100 requests in to reach the limit
        ipRequestCounts.set('1.2.3.4', {
            count: 100,
            resetTime: Date.now() + 60000
        });

        // 101st request
        rateLimiter(req, res, next);

        expect(statusSet).to.equal(429);
        expect(jsonSent.error).to.contain('Too many requests');
        expect(resHeaders['X-RateLimit-Remaining']).to.equal(0);
    });

    it('should reset window after resetTime expires', (done) => {
        const req = { ip: '1.2.3.4' };
        const headers = {};
        const res = {
            setHeader: (key, val) => {
                headers[key] = val;
            }
        };

        // Create expired entry
        ipRequestCounts.set('1.2.3.4', {
            count: 100,
            resetTime: Date.now() - 1000 // already expired
        });

        const next = () => {
            expect(headers['X-RateLimit-Remaining']).to.equal(99);
            done();
        };

        rateLimiter(req, res, next);
    });

    it('should prune old entries when Map size exceeds limit', () => {
        const now = Date.now();
        // Insert some expired entries
        for (let i = 0; i < 2005; i++) {
            ipRequestCounts.set(`10.0.0.${i}`, {
                count: 10,
                resetTime: now - 5000 // expired
            });
        }

        // Insert one active entry
        ipRequestCounts.set('1.2.3.4', {
            count: 5,
            resetTime: now + 60000 // active
        });

        const req = { ip: '1.2.3.4' };
        const res = { setHeader: () => {} };
        const next = () => {};

        // Trigger rateLimiter, which triggers pruneRateLimitMap if size exceeds 2000
        rateLimiter(req, res, next);

        // Expired entries should be pruned, only active entries retained (+ the current request if not matching 1.2.3.4)
        // Since we query 1.2.3.4, its count increases.
        // All 2005 expired entries should be removed because they resetTime <= now.
        expect(ipRequestCounts.size).to.be.lessThan(10);
    });

    it('should allow requests with unknown IP without rate limiting to prevent global DoS', () => {
        const req = { ip: 'unknown' };
        let statusSet = null;
        const res = {
            status: (s) => {
                statusSet = s;
                return res;
            },
            json: () => {}
        };

        let nextCalls = 0;
        const next = () => {
            nextCalls++;
        };

        for (let i = 0; i < 150; i++) {
            rateLimiter(req, res, next);
        }

        expect(nextCalls).to.equal(150);
        expect(statusSet).to.be.null;
        expect(ipRequestCounts.has('unknown')).to.be.false;
    });
});
