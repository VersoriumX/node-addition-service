// benchmark_middleware_order.js
// Compares middleware overhead for static requests: original vs optimized order

const { performance } = require('perf_hooks');
const { electricFence } = require('../../src/security');

// Mock request and response objects for a static file GET request
const mockReq = {
    method: 'GET',
    url: '/robots.txt',
    ip: '127.0.0.1',
    query: { ref: 'google', cache_bust: '12345' },
    body: {},
    headers: {}
};

const mockRes = {
    sendFile: () => {}
};

// Mock express.json() middleware behavior for a GET request (scans headers/body but does nothing)
function mockJsonMiddleware(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        // Simulates JSON parsing overhead if there were a body
    }
    next();
}

const ITERATIONS = 100000;

console.log('--- Benchmarking Static Route Middleware Order Optimization ---');

// Original Path: Runs express.json() and electricFence security middleware before resolving static requests
const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    let nextCalled = false;
    mockJsonMiddleware(mockReq, mockRes, () => {
        electricFence(mockReq, mockRes, () => {
            nextCalled = true;
        });
    });
    // Static file handler handles it
    mockRes.sendFile();
}
const endOriginal = performance.now();
const originalTime = endOriginal - startOriginal;
console.log(`Original Path (running JSON parser + ReDoS scan for static requests): ${originalTime.toFixed(4)}ms for ${ITERATIONS} iterations`);

// Optimized Path: Bypasses JSON parser and electricFence for static assets
const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Serves the file directly
    mockRes.sendFile();
}
const endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;
console.log(`Optimized Path (bypassing middleware for static requests): ${optimizedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);

const speedup = ((originalTime - optimizedTime) / originalTime) * 100;
console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
console.log(`Time saved per 100k static asset requests: ${(originalTime - optimizedTime).toFixed(2)}ms\n`);
