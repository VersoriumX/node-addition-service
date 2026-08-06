const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const { app } = require('../index');
const { ipRequestCounts } = require('../src/security');

describe('Rate Limiter Middleware', () => {
    let server;
    let baseUrl;

    before((done) => {
        server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
            done();
        });
    });

    after((done) => {
        server.close(done);
    });

    beforeEach(() => {
        // Clear rate limiter cache between tests to ensure a clean state
        ipRequestCounts.clear();
    });

    it('should set RateLimit headers on successful API requests', async () => {
        const res = await fetch(`${baseUrl}/api/tokens`);
        expect(res.status).to.equal(200);
        expect(res.headers.get('x-ratelimit-limit')).to.equal('100');
        expect(res.headers.get('x-ratelimit-remaining')).to.exist;
        expect(res.headers.get('x-ratelimit-reset')).to.exist;

        const remaining = parseInt(res.headers.get('x-ratelimit-remaining'), 10);
        expect(remaining).to.equal(99);
    });

    it('should decrement remaining requests on subsequent calls', async () => {
        await fetch(`${baseUrl}/api/tokens`);
        const res = await fetch(`${baseUrl}/api/tokens`);

        const remaining = parseInt(res.headers.get('x-ratelimit-remaining'), 10);
        expect(remaining).to.equal(98);
    });

    it('should block requests and return HTTP 429 when limits are exceeded', async () => {
        // Artificially simulate 100 previous requests from this client
        const initialRes = await fetch(`${baseUrl}/api/tokens`);
        expect(initialRes.status).to.equal(200);

        // Retrieve the registered IP from the map (should be the only entry)
        expect(ipRequestCounts.size).to.equal(1);
        const registeredIp = ipRequestCounts.keys().next().value;
        expect(registeredIp).to.exist;

        // Set the request count to exactly 100 (which is the limit)
        const clientData = ipRequestCounts.get(registeredIp);
        clientData.count = 100;

        // The 101st request should be blocked
        const blockedRes = await fetch(`${baseUrl}/api/tokens`);
        expect(blockedRes.status).to.equal(429);

        const data = await blockedRes.json();
        expect(data).to.have.property('error');
        expect(data.error).to.contain('Too many requests');
        expect(blockedRes.headers.get('x-ratelimit-remaining')).to.equal('0');
    });

    it('should not apply rate limiting to static/home page requests', async () => {
        const res = await fetch(`${baseUrl}/`);
        expect(res.status).to.equal(200);
        expect(res.headers.get('x-ratelimit-limit')).to.be.null;
        expect(ipRequestCounts.size).to.equal(0);
    });
});
