const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const serverApp = require('../server');

describe('Server.js Integration & Security Headers', () => {
    let server;
    let baseUrl;

    before((done) => {
        server = http.createServer(serverApp);
        server.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
            done();
        });
    });

    after((done) => {
        server.close(done);
    });

    it('should include standard security headers on HTTP responses from server.js', async () => {
        const res = await fetch(`${baseUrl}/robots.txt`);
        expect(res.status).to.equal(200);

        // Verify security headers added in server.js
        expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
        expect(res.headers.get('x-frame-options')).to.equal('DENY');
        expect(res.headers.get('x-content-type-options')).to.equal('nosniff');
        expect(res.headers.get('referrer-policy')).to.equal('no-referrer');
        expect(res.headers.get('x-xss-protection')).to.equal('1; mode=block');
        expect(res.headers.get('x-powered-by')).to.be.null;
    });

    it('should intercept malformed JSON payloads and return HTTP 400 without leaking stack traces', async () => {
        const res = await fetch(`${baseUrl}/api/tokens`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: '{ malformed json payload '
        });

        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data).to.have.property('error', 'Invalid JSON payload');
    });

    it('should handle empty JSON body payloads gracefully and return HTTP 400', async () => {
        const res = await fetch(`${baseUrl}/api/tokens`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: '{}'
        });

        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data).to.have.property('error', 'Name and value are required');
    });
});
