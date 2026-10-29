const { expect } = require('chai');
const { generateVariations } = require('../src/fuzzer');

describe('Fuzzer Service', () => {
    it('should generate variations of a string', () => {
        const base = 'pass';
        const variations = generateVariations(base);
        expect(variations).to.be.an('array');
        expect(variations).to.include('PASS');
        expect(variations).to.include('p455');
    });

    it('should throw TypeError if input is not a string', () => {
        expect(() => generateVariations(null)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(undefined)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(123)).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations(['foo'])).to.throw(TypeError, 'Input must be a string');
        expect(() => generateVariations({})).to.throw(TypeError, 'Input must be a string');
    });

    it('should throw RangeError if input length exceeds 250 characters', () => {
        const longInput = 'a'.repeat(251);
        expect(() => generateVariations(longInput)).to.throw(RangeError, 'Input length must not exceed 250 characters');
    });
});

describe('GET /api/fuzz Route Security & Validation Integration', () => {
    const { app } = require('../index');
    const http = require('http');
    const fetchRaw = require('node-fetch');
    const fetch = fetchRaw.default || fetchRaw;

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

    it('should return variations for valid input string', async () => {
        const res = await fetch(`${baseUrl}/api/fuzz?input=test`);
        expect(res.status).to.equal(200);
        const data = await res.json();
        expect(data.variations).to.be.an('array');
    });

    it('should return HTTP 400 when input query parameter is missing', async () => {
        const res = await fetch(`${baseUrl}/api/fuzz`);
        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data.error).to.equal('Input must be a string');
    });

    it('should return HTTP 400 when input is not a string (e.g. array query string)', async () => {
        const res = await fetch(`${baseUrl}/api/fuzz?input=a&input=b`);
        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data.error).to.equal('Input must be a string');
    });

    it('should return HTTP 400 when input length exceeds 250 characters', async () => {
        const longStr = 'a'.repeat(251);
        const res = await fetch(`${baseUrl}/api/fuzz?input=${longStr}`);
        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data.error).to.equal('Input must be 250 characters or less');
    });
});
