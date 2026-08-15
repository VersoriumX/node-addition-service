const assert = require('assert');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const app = require('../server');

describe('Server App Integration Tests', () => {
    let server;
    let baseUrl;

    before((done) => {
        server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            done();
        });
    });

    after((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    it('should set security headers on responses', async () => {
        const res = await fetch(`${baseUrl}/robots.txt`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
        assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
        assert.strictEqual(res.headers.get('referrer-policy'), 'no-referrer');
        assert.strictEqual(res.headers.get('x-xss-protection'), '1; mode=block');
        assert.ok(res.headers.get('content-security-policy').includes("default-src 'self'"));
    });

    it('should return 404 for unmatched API endpoints', async () => {
        const res = await fetch(`${baseUrl}/api/nonexistent`);
        assert.strictEqual(res.status, 404);
        const data = await res.json();
        assert.strictEqual(data.error, 'API endpoint not found');
    });

    it('should handle malformed JSON gracefully', async () => {
        const res = await fetch(`${baseUrl}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ malformed json '
        });
        assert.strictEqual(res.status, 400);
        const data = await res.json();
        assert.strictEqual(data.error, 'Invalid JSON payload');
    });
});
