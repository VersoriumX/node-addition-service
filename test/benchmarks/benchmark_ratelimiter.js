// test/benchmarks/benchmark_ratelimiter.js
const { rateLimiter, ipRequestCounts } = require('../../src/security');

// Create mock request and response objects
const createMockReq = (ip) => ({
    ip,
    headers: {}
});

const createMockRes = () => ({
    headers: {},
    setHeader(name, val) {
        this.headers[name] = val;
    },
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.jsonData = data;
        return this;
    }
});

const iterations = 100000; // 100k requests

console.log(`--- Benchmarking Rate Limiter Optimization (${iterations.toLocaleString()} iterations) ---`);

// Populate map with 2005 active entries to exceed the 2000 threshold
const now = Date.now();
for (let i = 0; i < 2005; i++) {
    ipRequestCounts.set(`10.0.0.${i}`, { count: 1, resetTime: now + 60000 });
}

function runBenchmark() {
    const req = createMockReq('10.0.0.1');
    const res = createMockRes();
    const next = () => {};

    // Warm up
    for (let i = 0; i < 100; i++) {
        ipRequestCounts.get('10.0.0.1').count = 0;
        rateLimiter(req, res, next);
    }

    const start = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        ipRequestCounts.get('10.0.0.1').count = 0;
        rateLimiter(req, res, next);
    }
    const end = parseFloat(process.hrtime.bigint()) / 1e6;
    const duration = end - start;

    console.log(`Optimized rateLimiter time for ${iterations.toLocaleString()} calls with 2000+ Map entries: ${duration.toFixed(2)}ms`);
    console.log(`Average time per call: ${(duration / iterations * 1000).toFixed(4)}μs`);
}

runBenchmark();
