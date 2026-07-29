const { performance } = require('perf_hooks');

// 1. Current implementation in index.js
function currentIsETagMatch(reqHeader, etag) {
    if (!reqHeader) return false;
    const cleanHeader = reqHeader.replace(/^W\//, '').trim();
    const cleanETag = etag.replace(/^W\//, '').trim();
    if (cleanHeader === cleanETag) return true;
    return reqHeader.includes(cleanETag);
}

// 2. Optimized implementation
function optimizedIsETagMatch(reqHeader, etag) {
    if (!reqHeader) return false;
    if (reqHeader === etag) return true;

    const cleanHeader = reqHeader.startsWith('W/') ? reqHeader.slice(2) : reqHeader;
    const cleanETag = etag.startsWith('W/') ? etag.slice(2) : etag;

    if (cleanHeader === cleanETag) return true;
    return cleanHeader.includes(cleanETag);
}

const ITERATIONS = 1000000; // 1 million

function runBenchmark(reqHeader, etag, scenarioName) {
    console.log(`--- Scenario: ${scenarioName} ---`);

    // Warm-up
    for (let i = 0; i < 10000; i++) {
        currentIsETagMatch(reqHeader, etag);
        optimizedIsETagMatch(reqHeader, etag);
    }

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentIsETagMatch(reqHeader, etag);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedIsETagMatch(reqHeader, etag);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
    console.log(`Current:   ${currentTime.toFixed(2)}ms`);
    console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:   ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark('"my-etag"', '"my-etag"', 'Exact Match');
runBenchmark('W/"my-etag"', '"my-etag"', 'Weak Match');
runBenchmark('"other-etag", "my-etag"', '"my-etag"', 'List Match');
runBenchmark('"other-etag"', '"my-etag"', 'Mismatched');
runBenchmark(undefined, '"my-etag"', 'Undefined Header');
