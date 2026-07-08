const { electricFence, quarantinedIPs } = require('../../src/security');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000;

function benchmark(name, req) {
    quarantinedIPs.clear();
    const res = {
        status: () => res,
        json: () => res
    };
    const next = () => {};

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        electricFence(req, res, next);
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking Electric Fence Security Middleware ---');

const normalReq = {
    query: { a: '123', b: 'test' },
    body: { key: 'value' },
    ip: '1.1.1.1'
};

const longReq = {
    query: { a: 'a'.repeat(1001) },
    body: {},
    ip: '2.2.2.2'
};

const globReq = {
    query: { path: '**/**/**' },
    body: {},
    ip: '3.3.3.3'
};

const normalTime = benchmark('Normal Request', normalReq);
const longTime = benchmark('Long String Request (Suspicious)', longReq);
const globTime = benchmark('Globstar Request (Suspicious)', globReq);

console.log('\nBaseline results recorded.');
