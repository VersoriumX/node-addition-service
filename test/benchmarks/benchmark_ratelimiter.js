const { rateLimiter, ipRequestCounts } = require('../../src/security');

function runBenchmark() {
    ipRequestCounts.clear();

    const res = {
        setHeader: () => {},
        status: () => ({ json: () => {} })
    };
    const next = () => {};

    const iterations = 500000;

    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        const req = { ip: `10.0.${(i / 250) | 0}.${i % 250}` };
        rateLimiter(req, res, next);
    }
    const end = process.hrtime.bigint();

    const elapsedMs = Number(end - start) / 1e6;
    console.log(`500,000 rateLimiter requests took: ${elapsedMs.toFixed(2)} ms`);
}

runBenchmark();
