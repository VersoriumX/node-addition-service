const { describe, it } = require('mocha');
const { expect } = require('chai');
const { securityMiddleware, quarantinedIPs } = require('../src/security');

describe('Security Middleware', () => {
    it('should allow normal requests', (done) => {
        const req = { query: { a: '1', b: '2' }, ip: '1.2.3.4' };
        const res = {};
        const next = () => {
            expect(quarantinedIPs.has('1.2.3.4')).to.be.false;
            done();
        };
        securityMiddleware(req, res, next);
    });

    it('should quarantine and block suspicious requests', () => {
        const longString = 'a'.repeat(1001);
        const req = { query: { a: longString }, ip: '6.6.6.6' };
        let statusSet = 0;
        let sentMessage = '';
        const res = {
            status: (s) => { statusSet = s; return res; },
            send: (m) => { sentMessage = m; }
        };
        const next = () => { throw new Error('Next should not be called'); };

        securityMiddleware(req, res, next);

        expect(statusSet).to.equal(403);
        expect(sentMessage).to.contain('Suspicious activity');
        expect(quarantinedIPs.has('6.6.6.6')).to.be.true;
    });

    it('should continue to block quarantined IPs', () => {
        quarantinedIPs.add('9.9.9.9');
        const req = { query: { a: '1' }, ip: '9.9.9.9' };
        let statusSet = 0;
        const res = {
            status: (s) => { statusSet = s; return res; },
            send: (m) => {}
        };
        const next = () => { throw new Error('Next should not be called'); };

        securityMiddleware(req, res, next);

        expect(statusSet).to.equal(403);
    });
});
