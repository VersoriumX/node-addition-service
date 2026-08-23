const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const { app } = require('../server');

describe('Server.js Security Features', () => {
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

    it('should include standard security headers on responses from server.js', async () => {
        const res = await fetch(`${baseUrl}/robots.txt`);
        expect(res.status).to.equal(200);

        // 🛡️ Sentinel: Verify HTTP Security Headers
        expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
        expect(res.headers.get('x-frame-options')).to.equal('DENY');
        expect(res.headers.get('x-content-type-options')).to.equal('nosniff');
        expect(res.headers.get('referrer-policy')).to.equal('no-referrer');
        expect(res.headers.get('x-xss-protection')).to.equal('1; mode=block');
        expect(res.headers.get('x-powered-by')).to.be.null;
    });

    it('should handle malformed JSON gracefully in server.js without leaking stack trace', async () => {
        const res = await fetch(`${baseUrl}/api/tokens`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: '{ bad json payload '
        });

        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data).to.deep.equal({ error: 'Invalid JSON payload' });
    });
});
