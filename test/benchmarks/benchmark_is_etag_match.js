const { performance } = require('perf_hooks');

function isETagMatchOriginal(reqHeader, etag) {
    if (!reqHeader) return false;
    const cleanHeader = reqHeader.replace(/^W\//, '').trim();
    const cleanETag = etag.replace(/^W\//, '').trim();
    if (cleanHeader === cleanETag) return true;
    return reqHeader.includes(cleanETag);
}

function isETagMatchOptimized(reqHeader, etag) {
    if (!reqHeader) return false;
    if (reqHeader === etag) return true;

    // Fast prefix stripping
    const cleanHeader = reqHeader.startsWith('W/') ? reqHeader.slice(2) : reqHeader;
    const cleanETag = etag.startsWith('W/') ? etag.slice(2) : etag;

    if (cleanHeader === cleanETag) return true;
    return reqHeader.includes(cleanETag);
}

const ITERATIONS = 1000000;
const testCases = [
    { req: '"abcdef"', etag: '"abcdef"' },
    { req: 'W/"abcdef"', etag: '"abcdef"' },
    { req: '"abcdef"', etag: 'W/"abcdef"' },
    { req: 'W/"abcdef"', etag: 'W/"abcdef"' },
    { req: '"other", W/"abcdef"', etag: '"abcdef"' },
    { req: null, etag: '"abcdef"' }
];

console.log('--- Benchmarking isETagMatch Optimization ---');

const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const tc of testCases) {
        isETagMatchOriginal(tc.req, tc.etag);
    }
}
const endOriginal = performance.now();
const originalTime = endOriginal - startOriginal;

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const tc of testCases) {
        isETagMatchOptimized(tc.req, tc.etag);
    }
}
const endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;

console.log(`Original isETagMatch: ${originalTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`Optimized isETagMatch: ${optimizedTime.toFixed(4)}ms for ${ITERATIONS} iterations`);

const speedup = ((originalTime - optimizedTime) / originalTime * 100).toFixed(2);
console.log(`Estimated Performance Gain: ${speedup}% faster`);
