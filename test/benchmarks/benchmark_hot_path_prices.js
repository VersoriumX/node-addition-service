// test/benchmarks/benchmark_hot_path_prices.js
// Compares old async-always path vs new synchronous cache-check fast path for cached prices.

const CACHE_DURATION = 60 * 1000;

// Mock cache
const cache = {
    data: { price: 100 },
    json: '{"price":100}',
    etag: '"abcd"',
    timestamp: Date.now() // fully fresh cache
};

// Simulate isCacheValid
function isCacheValid() {
    return !!(cache.data && (Date.now() - cache.timestamp < CACHE_DURATION));
}

// Simulate the old fetchMetalPrices (async, always returns a promise and resolves cache)
async function oldFetchMetalPrices() {
    if (cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
        return cache;
    }
    // would fetch...
    return cache;
}

// Old route path (must await)
async function runOldPath() {
    await oldFetchMetalPrices();
    // serve response...
    return cache.json;
}

// New route path (can serve synchronously if valid)
function runNewPath() {
    if (isCacheValid()) {
        return cache.json;
    }
    // fallback would await oldFetchMetalPrices...
    return cache.json;
}

const iterations = 1000000; // 1 million iterations

console.log("--- Benchmarking Price Hot Path Optimization (1,000,000 iterations) ---");

async function runBenchmark() {
    // Benchmark Old Path (async)
    const startOld = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        await runOldPath();
    }
    const endOld = parseFloat(process.hrtime.bigint()) / 1e6;
    const oldTime = endOld - startOld;
    console.log(`Original Path (Always Async/Await): ${oldTime.toFixed(4)}ms`);

    // Benchmark New Path (Sync cache check)
    const startNew = parseFloat(process.hrtime.bigint()) / 1e6;
    for (let i = 0; i < iterations; i++) {
        runNewPath();
    }
    const endNew = parseFloat(process.hrtime.bigint()) / 1e6;
    const newTime = endNew - startNew;
    console.log(`Optimized Path (Synchronous Cache Check Bypass): ${newTime.toFixed(4)}ms`);

    const speedup = ((oldTime - newTime) / oldTime) * 100;
    console.log(`\nEstimated Performance Gain for Hot-Path Cache Reads: ${speedup.toFixed(2)}% faster`);
    console.log(`Time saved per 1M requests: ${(oldTime - newTime).toFixed(2)}ms`);
}

runBenchmark();
