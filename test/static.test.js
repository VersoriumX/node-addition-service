const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const {
    app,
    isETagMatch,
    robotsETag,
    indexHtmlETag,
    rareearthHtmlETag,
    isolationJsonETag,
    robotsContent,
    indexHtmlContent,
    rareearthHtmlContent,
    isolationJsonContent
} = require('../index');

describe('Static File Caching & Routes', () => {
    let server;
    let baseUrl;

    before((done) => {
        // Start the server on an ephemeral (random free) port
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

    describe('isETagMatch Helper', () => {
        it('should return true for exact matches', () => {
            expect(isETagMatch('"my-etag"', '"my-etag"')).to.be.true;
        });

        it('should return true for weak ETag matching', () => {
            expect(isETagMatch('W/"my-etag"', '"my-etag"')).to.be.true;
            expect(isETagMatch('"my-etag"', 'W/"my-etag"')).to.be.true;
            expect(isETagMatch('W/"my-etag"', 'W/"my-etag"')).to.be.true;
        });

        it('should return true for matching ETags inside comma-separated lists', () => {
            expect(isETagMatch('"other-etag", "my-etag"', '"my-etag"')).to.be.true;
            expect(isETagMatch('W/"other-etag", W/"my-etag"', '"my-etag"')).to.be.true;
        });

        it('should return false for mismatched ETags', () => {
            expect(isETagMatch('"other-etag"', '"my-etag"')).to.be.false;
            expect(isETagMatch('', '"my-etag"')).to.be.false;
            expect(isETagMatch(undefined, '"my-etag"')).to.be.false;
        });
    });

    describe('GET /robots.txt', () => {
        it('should return 200 with the correct robots content and ETag', async () => {
            const res = await fetch(`${baseUrl}/robots.txt`);
            expect(res.status).to.equal(200);
            expect(res.headers.get('etag')).to.equal(robotsETag);
            expect(res.headers.get('content-type')).to.contain('text/plain');

            // 🛡️ Sentinel: Verify security headers
            expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
            expect(res.headers.get('x-frame-options')).to.equal('DENY');
            expect(res.headers.get('x-content-type-options')).to.equal('nosniff');
            expect(res.headers.get('referrer-policy')).to.equal('no-referrer');
            expect(res.headers.get('x-xss-protection')).to.equal('1; mode=block');
            expect(res.headers.get('x-powered-by')).to.be.null;

            const body = await res.text();
            expect(body).to.equal(robotsContent.toString());
        });

        it('should return 304 when conditional If-None-Match header matches robotsETag', async () => {
            const res = await fetch(`${baseUrl}/robots.txt`, {
                headers: {
                    'if-none-match': robotsETag
                }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(robotsETag);
        });

        it('should return 304 when conditional If-None-Match header matches weak robotsETag', async () => {
            const res = await fetch(`${baseUrl}/robots.txt`, {
                headers: {
                    'if-none-match': `W/${robotsETag}`
                }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(robotsETag);
        });
    });

    describe('GET /', () => {
        it('should return 200 with the correct home page html and ETag', async () => {
            const res = await fetch(`${baseUrl}/`);
            expect(res.status).to.equal(200);
            expect(res.headers.get('etag')).to.equal(indexHtmlETag);
            expect(res.headers.get('content-type')).to.contain('text/html');

            // 🛡️ Sentinel: Verify security headers
            expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
            expect(res.headers.get('x-frame-options')).to.equal('DENY');
            expect(res.headers.get('x-content-type-options')).to.equal('nosniff');
            expect(res.headers.get('referrer-policy')).to.equal('no-referrer');
            expect(res.headers.get('x-xss-protection')).to.equal('1; mode=block');
            expect(res.headers.get('x-powered-by')).to.be.null;

            const body = await res.text();
            expect(body).to.equal(indexHtmlContent.toString());
        });

        it('should return 304 when conditional If-None-Match header matches indexHtmlETag', async () => {
            const res = await fetch(`${baseUrl}/`, {
                headers: {
                    'if-none-match': indexHtmlETag
                }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(indexHtmlETag);
        });

        it('should return 304 when conditional If-None-Match header matches weak indexHtmlETag', async () => {
            const res = await fetch(`${baseUrl}/`, {
                headers: {
                    'if-none-match': `W/${indexHtmlETag}`
                }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(indexHtmlETag);
        });
    });

    describe('GET /rareearth.html', () => {
        it('should return 200 with correct html and ETag', async () => {
            const res = await fetch(`${baseUrl}/rareearth.html`);
            expect(res.status).to.equal(200);
            expect(res.headers.get('etag')).to.equal(rareearthHtmlETag);
            expect(res.headers.get('content-type')).to.contain('text/html');

            // 🛡️ Sentinel: Verify security headers
            expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
            expect(res.headers.get('x-frame-options')).to.equal('DENY');
            expect(res.headers.get('x-content-type-options')).to.equal('nosniff');

            const body = await res.text();
            expect(body).to.equal(rareearthHtmlContent.toString());
        });

        it('should return 304 when If-None-Match matches', async () => {
            const res = await fetch(`${baseUrl}/rareearth.html`, {
                headers: { 'if-none-match': rareearthHtmlETag }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(rareearthHtmlETag);
        });
    });

    describe('GET /isolation.json', () => {
        it('should return 200 with correct json and ETag', async () => {
            const res = await fetch(`${baseUrl}/isolation.json`);
            expect(res.status).to.equal(200);
            expect(res.headers.get('etag')).to.equal(isolationJsonETag);
            expect(res.headers.get('content-type')).to.contain('application/json');

            // 🛡️ Sentinel: Verify security headers
            expect(res.headers.get('content-security-policy')).to.contain("default-src 'self'");
            expect(res.headers.get('x-frame-options')).to.equal('DENY');
            expect(res.headers.get('x-content-type-options')).to.equal('nosniff');

            const body = await res.text();
            expect(body).to.equal(isolationJsonContent.toString());
        });

        it('should return 304 when If-None-Match matches', async () => {
            const res = await fetch(`${baseUrl}/isolation.json`, {
                headers: { 'if-none-match': isolationJsonETag }
            });
            expect(res.status).to.equal(304);
            expect(res.headers.get('etag')).to.equal(isolationJsonETag);
        });
    });

    describe('GET /add Endpoint Input Validation', () => {
        it('should return 200 with result for valid numeric parameters', async () => {
            const res = await fetch(`${baseUrl}/add?a=10&b=20`);
            expect(res.status).to.equal(200);
            const body = await res.text();
            expect(body).to.equal('Hello World!: 30');
        });

        it('should return 400 when parameters a or b are missing', async () => {
            const res = await fetch(`${baseUrl}/add?a=10`);
            expect(res.status).to.equal(400);
            const body = await res.text();
            expect(body).to.contain('Parameters a and b are required');
        });

        it('should return 400 when parameters are not valid numbers', async () => {
            const res = await fetch(`${baseUrl}/add?a=abc&b=20`);
            expect(res.status).to.equal(400);
            const body = await res.text();
            expect(body).to.contain('Parameters a and b must be valid numbers');
        });

        it('should return 400 when input length exceeds 100 characters', async () => {
            const longString = '1'.repeat(101);
            const res = await fetch(`${baseUrl}/add?a=${longString}&b=20`);
            expect(res.status).to.equal(400);
            const body = await res.text();
            expect(body).to.contain('Input length must not exceed 100 characters');
        });
    });

    describe('Global Error Handler & Null JSON Payload Handling', () => {
        it('should handle malformed JSON and return 400 with a clean message', async () => {
            const res = await fetch(`${baseUrl}/api/tokens`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: '{ malformed json '
            });
            expect(res.status).to.equal(400);
            const data = await res.json();
            expect(data).to.have.property('error', 'Invalid JSON payload');
        });

        it('should handle null JSON payloads on POST endpoints and return 400', async () => {
            const res = await fetch(`${baseUrl}/api/encrypt`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: 'null'
            });
            expect(res.status).to.equal(400);
            const data = await res.json();
            expect(data).to.have.property('error');
        });
    });
});
