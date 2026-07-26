// test/benchmarks/benchmark_static_cache.js
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const filePath = path.join(__dirname, '../../public/robots.txt');

// Case 1: Read from disk (simulates res.sendFile without cache)
async function serveFromDisk() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

// Case 2: Serve from memory (simulates in-memory cache)
const cachedContent = fs.readFileSync(filePath, 'utf8');
async function serveFromMemory() {
    return cachedContent;
}

const ITERATIONS = 10000; // 10k file reads (lower than 1M because disk I/O is slow)

console.log(`--- Benchmarking Static File Reading vs In-Memory Caching (${ITERATIONS.toLocaleString()} iterations) ---`);

async function run() {
    // Warm up
    for (let i = 0; i < 100; i++) {
        await serveFromDisk();
        await serveFromMemory();
    }

    // Benchmark serveFromDisk
    const startDisk = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await serveFromDisk();
    }
    const endDisk = performance.now();
    const diskTime = endDisk - startDisk;
    console.log(`Read from Disk: ${diskTime.toFixed(4)}ms`);

    // Benchmark serveFromMemory
    const startMemory = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await serveFromMemory();
    }
    const endMemory = performance.now();
    const memoryTime = endMemory - startMemory;
    console.log(`Serve from Memory: ${memoryTime.toFixed(4)}ms`);

    const speedup = ((diskTime - memoryTime) / diskTime * 100).toFixed(2);
    console.log(`\nEstimated Performance Gain for Static Files: ${speedup}% faster`);
    console.log(`Time saved per ${ITERATIONS.toLocaleString()} requests: ${(diskTime - memoryTime).toFixed(2)}ms`);
}

run();
