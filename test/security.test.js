const { expect } = require('chai');
const http = require('http');

describe('Electric Fence Security', () => {
    let server;
    const port = 3003;

    before((done) => {
        const { spawn } = require('child_process');
        server = spawn('node', ['index.js'], { env: { ...process.env, PORT: port } });
        server.stdout.on('data', (data) => {
            if (data.toString().includes('listening at')) {
                done();
            }
        });
    });

    after(() => {
        server.kill();
    });

    it('should block suspicious long payloads and then quarantine the IP', (done) => {
        const longPayload = 'a'.repeat(1001);
        // First request: detect and quarantine
        http.get(`http://localhost:${port}/api/fuzz?input=${longPayload}`, (res) => {
            expect(res.statusCode).to.equal(400);

            // Second request: already quarantined
            http.get(`http://localhost:${port}/api/fuzz?input=normal`, (res2) => {
                expect(res2.statusCode).to.equal(403);
                done();
            });
        });
    });
});
