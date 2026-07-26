// test/benchmarks/benchmark_static_cache.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 100000; // 100k requests

// Simulation helpers for the unoptimized route
function runUnoptimized() {
    const robotsPath = path.join(__dirname, '../../public', 'robots.txt');
    const content = fs.readFileSync(robotsPath);
    const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`;
    return {
        content,
        contentType: 'text/plain; charset=utf-8',
        etag
    };
}

// Simulation helpers for the optimized route (pre-loaded cache)
const staticCache = {};
const robotsPath = path.join(__dirname, '../../public', 'robots.txt');
const content = fs.readFileSync(robotsPath);
const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`;
staticCache['/robots.txt'] = {
    content,
    contentType: 'text/plain; charset=utf-8',
    etag
};

function runOptimized() {
    const cache = staticCache['/robots.txt'];
    return {
        content: cache.content,
        contentType: cache.contentType,
        etag: cache.etag
    };
}

function runBenchmark() {
    console.log(`--- Benchmarking Static Cache Eager Loading & Pre-calculation (${ITERATIONS.toLocaleString()} iterations) ---`);

    // Warm-up
    for (let i = 0; i < 1000; i++) {
        runUnoptimized();
        runOptimized();
    }

    // Benchmark Unoptimized (Reads file & hashes on the fly)
    const startUnoptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        runUnoptimized();
    }
    const endUnoptimized = performance.now();
    const unoptimizedTime = endUnoptimized - startUnoptimized;
    console.log(`Unoptimized Path (Disk I/O + Dynamic Hashing): ${unoptimizedTime.toFixed(4)}ms`);

    // Benchmark Optimized (Served directly from memory cache)
    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        runOptimized();
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;
    console.log(`Optimized Path (In-Memory Static Cache): ${optimizedTime.toFixed(4)}ms`);

    const speedup = ((unoptimizedTime - optimizedTime) / unoptimizedTime) * 100;
    console.log(`\nEstimated Performance Gain for Static Cached Retrieval: ${speedup.toFixed(2)}% faster`);
    console.log(`Time saved per ${ITERATIONS.toLocaleString()} requests: ${(unoptimizedTime - optimizedTime).toFixed(2)}ms`);
}

runBenchmark();
