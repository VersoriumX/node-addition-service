const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const http = require('http');
const nodeFetch = require('node-fetch');
const fetch = nodeFetch.default || nodeFetch;
const { app, isETagMatch, robotsETag, indexHtmlETag, robotsContent, indexHtmlContent } = require('../index');

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

    describe('Global Error Handler', () => {
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
    });

    describe('GET /add with strict input validation', () => {
        it('should return 200 with correct sum for valid inputs', async () => {
            const res = await fetch(`${baseUrl}/add?a=12&b=34`);
            expect(res.status).to.equal(200);
            const text = await res.text();
            expect(text).to.equal('Hello World!: 46');
        });

        it('should return 400 when parameters are missing', async () => {
            const res = await fetch(`${baseUrl}/add?a=12`);
            expect(res.status).to.equal(400);
            const data = await res.json();
            expect(data).to.have.property('error', 'Parameters a and b are required');
        });

        it('should return 400 when parameters are not finite numbers', async () => {
            const res = await fetch(`${baseUrl}/add?a=12&b=abc`);
            expect(res.status).to.equal(400);
            const data = await res.json();
            expect(data).to.have.property('error', 'Parameters a and b must be valid finite numbers');
        });

        it('should return 400 when parameters exceed length of 20 characters', async () => {
            const longVal = '1'.repeat(21);
            const res = await fetch(`${baseUrl}/add?a=12&b=${longVal}`);
            expect(res.status).to.equal(400);
            const data = await res.json();
            expect(data).to.have.property('error', 'Parameters a and b must be strings under 20 characters');
        });
    });
});
