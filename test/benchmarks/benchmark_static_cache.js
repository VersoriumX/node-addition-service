// test/benchmarks/benchmark_static_cache.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Setup mock request and response
const createMockReq = (etag = '') => ({
    headers: {
        'if-none-match': etag
    }
});

const createMockRes = () => {
    const res = {
        headers: {},
        statusCode: 200,
        body: null,
        set(name, val) {
            if (typeof name === 'object') {
                Object.assign(this.headers, name);
            } else {
                this.headers[name] = val;
            }
            return res;
        },
        status(code) {
            this.statusCode = code;
            return res;
        },
        send(content) {
            this.body = content;
            return res;
        },
        end() {
            this.ended = true;
            return res;
        }
    };
    return res;
};

// 1. Unoptimized simulated implementation using synchronous disk read (simulates SendFile overhead)
const robotsTxtPath = path.join(__dirname, '..', '..', 'public', 'robots.txt');
function runUnoptimized(req, res) {
    // Disk read on every call
    const content = fs.readFileSync(robotsTxtPath, 'utf8');
    const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`;
    if (req.headers['if-none-match'] === etag) {
        return res.set('ETag', etag).status(304).end();
    }
    res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'ETag': etag
    }).send(content);
}

// 2. Optimized path serving from memory cache
const robotsTxtContent = fs.readFileSync(robotsTxtPath, 'utf8');
const robotsTxtEtag = `"${crypto.createHash('md5').update(robotsTxtContent).digest('hex')}"`;
function runOptimized(req, res) {
    if (req.headers['if-none-match'] === robotsTxtEtag) {
        return res.set('ETag', robotsTxtEtag).status(304).end();
    }
    res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'ETag': robotsTxtEtag
    }).send(robotsTxtContent);
}

const iterations = 100000;

console.log('--- Benchmarking Static Route Caching (100,000 iterations) ---');

function runBenchmark() {
    // Warm-up
    for (let i = 0; i < 1000; i++) {
        runUnoptimized(createMockReq(), createMockRes());
        runOptimized(createMockReq(), createMockRes());
    }

    // Benchmark 1a: Unoptimized (Normal Request - 200 OK with disk read)
    let start = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        runUnoptimized(createMockReq(), createMockRes());
    }
    let end = parseFloat(process.hrtime.bigint()) / 1e6;
    const unoptimizedTime200 = end - start;
    console.log(`Unoptimized (200 OK, Disk Read): ${unoptimizedTime200.toFixed(4)}ms`);

    // Benchmark 1b: Optimized (Normal Request - 200 OK from memory)
    start = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        runOptimized(createMockReq(), createMockRes());
    }
    end = parseFloat(process.hrtime.bigint()) / 1e6;
    const optimizedTime200 = end - start;
    console.log(`Optimized (200 OK, In-Memory):  ${optimizedTime200.toFixed(4)}ms`);
    console.log(`Speedup (200 OK): ${(((unoptimizedTime200 - optimizedTime200) / unoptimizedTime200) * 100).toFixed(2)}% faster\n`);

    // Benchmark 2a: Unoptimized (Conditional Request - 304 Not Modified with disk read)
    start = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        runUnoptimized(createMockReq(robotsTxtEtag), createMockRes());
    }
    end = parseFloat(process.hrtime.bigint()) / 1e6;
    const unoptimizedTime304 = end - start;
    console.log(`Unoptimized (304 Not Modified, Disk Read): ${unoptimizedTime304.toFixed(4)}ms`);

    // Benchmark 2b: Optimized (Conditional Request - 304 Not Modified from memory)
    start = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        runOptimized(createMockReq(robotsTxtEtag), createMockRes());
    }
    end = parseFloat(process.hrtime.bigint()) / 1e6;
    const optimizedTime304 = end - start;
    console.log(`Optimized (304 Not Modified, In-Memory):  ${optimizedTime304.toFixed(4)}ms`);
    console.log(`Speedup (304 Not Modified): ${(((unoptimizedTime304 - optimizedTime304) / unoptimizedTime304) * 100).toFixed(2)}% faster\n`);
}

runBenchmark();
