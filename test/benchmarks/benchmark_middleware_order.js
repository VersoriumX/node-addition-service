// test/benchmarks/benchmark_middleware_order.js
const express = require('express');
const { electricFence } = require('../../src/security');

// Create mock request and response objects
const createMockReq = () => ({
    method: 'GET',
    url: '/robots.txt',
    headers: {
        'content-type': 'application/json'
    },
    query: {},
    body: {}
});

const createMockRes = () => ({
    headers: {},
    setHeader(name, val) {
        this.headers[name] = val;
    },
    set(name, val) {
        if (typeof name === 'object') {
            Object.assign(this.headers, name);
        } else {
            this.headers[name] = val;
        }
        return this;
    },
    sendFile(path) {
        this.sentFile = path;
    },
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.jsonData = data;
        return this;
    },
    end() {
        this.ended = true;
    }
});

const jsonMiddleware = express.json();

// 1. Unoptimized Path: JSON Parsing -> Electric Fence -> Route Handler
function runUnoptimizedPath(req, res, callback) {
    jsonMiddleware(req, res, (err) => {
        if (err) return callback(err);
        electricFence(req, res, (err2) => {
            if (err2) return callback(err2);
            // Static route handler
            res.sendFile('/app/public/robots.txt');
            callback();
        });
    });
}

// 2. Optimized Path: Bypasses middleware, goes straight to Route Handler
function runOptimizedPath(req, res, callback) {
    // Static route handler directly
    res.sendFile('/app/public/robots.txt');
    callback();
}

const iterations = 100000; // 100k requests

console.log(`--- Benchmarking Middleware Pipeline Optimization (${iterations.toLocaleString()} iterations) ---`);

function runBenchmark() {
    // Warm-up
    for (let i = 0; i < 1000; i++) {
        runUnoptimizedPath(createMockReq(), createMockRes(), () => {});
        runOptimizedPath(createMockReq(), createMockRes(), () => {});
    }

    // Benchmark Unoptimized Path
    const startUnoptimized = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        const req = createMockReq();
        const res = createMockRes();
        runUnoptimizedPath(req, res, () => {});
    }
    const endUnoptimized = parseFloat(process.hrtime.bigint()) / 1e6;
    const unoptimizedTime = endUnoptimized - startUnoptimized;
    console.log(`Unoptimized Path (express.json + electricFence + Static): ${unoptimizedTime.toFixed(4)}ms`);

    // Benchmark Optimized Path
    const startOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        const req = createMockReq();
        const res = createMockRes();
        runOptimizedPath(req, res, () => {});
    }
    const endOptimized = parseFloat(process.hrtime.bigint()) / 1e6;
    const optimizedTime = endOptimized - startOptimized;
    console.log(`Optimized Path (Direct Static Handler): ${optimizedTime.toFixed(4)}ms`);

    const speedup = ((unoptimizedTime - optimizedTime) / unoptimizedTime) * 100;
    console.log(`\nEstimated Performance Gain for Static Requests: ${speedup.toFixed(2)}% faster`);
    console.log(`Time saved per ${iterations.toLocaleString()} requests: ${(unoptimizedTime - optimizedTime).toFixed(2)}ms`);
}

runBenchmark();
