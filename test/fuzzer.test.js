const { expect } = require('chai');
const http = require('http');
const fetchRaw = require('node-fetch');
const fetch = fetchRaw.default || fetchRaw;
const { generateVariations } = require('../src/fuzzer');
const { app } = require('../index');

describe('Fuzzer Service', () => {
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

    it('GET /api/fuzz should return 200 with variations for valid input', async () => {
        const res = await fetch(`${baseUrl}/api/fuzz?input=test`);
        expect(res.status).to.equal(200);
        const data = await res.json();
        expect(data).to.have.property('variations');
        expect(data.variations).to.be.an('array');
    });

    it('GET /api/fuzz should return 400 when input query parameter is missing', async () => {
        const res = await fetch(`${baseUrl}/api/fuzz`);
        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data).to.have.property('error', 'Input must be a string');
    });

    it('GET /api/fuzz should return 400 when input length exceeds 250 characters', async () => {
        const longInput = 'a'.repeat(251);
        const res = await fetch(`${baseUrl}/api/fuzz?input=${longInput}`);
        expect(res.status).to.equal(400);
        const data = await res.json();
        expect(data).to.have.property('error', 'Input must be 250 characters or less');
    });
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
