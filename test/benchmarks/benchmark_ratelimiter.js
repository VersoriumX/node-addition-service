// test/benchmarks/benchmark_ratelimiter.js
// Measures performance of rateLimiter middleware during high-traffic spikes when Map size > 2000.

const { rateLimiter, ipRequestCounts } = require('../../src/security');

console.log("--- Benchmarking In-Memory Rate Limiter Performance ---");

// Reset Map
ipRequestCounts.clear();

// Populate Map with 2005 active IP entries
const now = Date.now();
for (let i = 0; i < 2005; i++) {
    ipRequestCounts.set(`10.0.${Math.floor(i / 256)}.${i % 256}`, {
        count: 1,
        resetTime: now + 60000
    });
}

const req = { ip: '10.0.0.1', socket: {} };
const res = { setHeader: () => {}, status: () => ({ json: () => {} }) };
const next = () => {};

const iterations = 100000;

const start = parseFloat(process.hrtime.bigint()) / 1e6;
for (let i = 0; i < iterations; i++) {
    rateLimiter(req, res, next);
}
const end = parseFloat(process.hrtime.bigint()) / 1e6;
const duration = end - start;

console.log(`Execution time for ${iterations.toLocaleString()} requests: ${duration.toFixed(2)}ms`);
console.log(`Average time per request: ${(duration / iterations * 1000).toFixed(4)} μs`);
