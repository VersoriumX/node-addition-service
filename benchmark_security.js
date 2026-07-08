const { electricFence } = require('./src/security');

function benchmark() {
    const iterations = 1000000;
    const req = {
        query: { q: 'search term', page: '1' },
        body: { user: 'jules', role: 'engineer' },
        ip: '127.0.0.1'
    };
    const res = {
        status: () => ({ json: () => {} })
    };
    const next = () => {};

    console.log(`Running security middleware benchmark with ${iterations} iterations...`);
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
        electricFence(req, res, next);
    }
    const end = Date.now();
    console.log(`Total time: ${end - start}ms`);
    console.log(`Average time per request: ${(end - start) / iterations}ms`);
}

benchmark();
