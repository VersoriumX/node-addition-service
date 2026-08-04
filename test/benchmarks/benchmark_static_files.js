const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const rareEarthPath = path.join(__dirname, '../../public/rareearth.html');
const isolationPath = path.join(__dirname, '../../public/isolation.json');

console.log('--- Benchmarking Static Files (rareearth.html & isolation.json) Reading vs In-Memory Cached serving with ETag ---');

// 1. Dynamic path (simulate dynamic disk read + MD5 hashing)
function runDynamicRead() {
    const rareearth = fs.readFileSync(rareEarthPath, 'utf8');
    const isolation = fs.readFileSync(isolationPath, 'utf8');

    const etagR = crypto.createHash('md5').update(rareearth).digest('hex');
    const etagI = crypto.createHash('md5').update(isolation).digest('hex');

    return { rareearth, isolation, etagR, etagI };
}

// 2. Optimized path (pre-calculated on startup)
const rareEarthCache = fs.readFileSync(rareEarthPath);
const isolationCache = fs.readFileSync(isolationPath);

const rareEarthETag = `"${crypto.createHash('md5').update(rareEarthCache).digest('hex')}"`;
const isolationETag = `"${crypto.createHash('md5').update(isolationCache).digest('hex')}"`;

function runCachedCheck(headers = {}) {
    // Check if-none-match header for isolation.json
    if (headers['if-none-match'] === isolationETag) {
        return { status: 304 };
    }
    return { status: 200, body: isolationCache, etag: isolationETag };
}

// Benchmarking
const startDynamic = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runDynamicRead();
}
const endDynamic = performance.now();
const dynamicTime = endDynamic - startDynamic;

const startCached200 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck({}); // standard 200 response
}
const endCached200 = performance.now();
const cached200Time = endCached200 - startCached200;

const startCached304 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck({ 'if-none-match': isolationETag }); // 304 response
}
const endCached304 = performance.now();
const cached304Time = endCached304 - startCached304;

console.log(`Dynamic Disk Read + Hashing: ${dynamicTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`In-Memory Cached (200 OK): ${cached200Time.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`In-Memory Cached (304 Not Modified): ${cached304Time.toFixed(4)}ms for ${ITERATIONS} iterations`);

const gain200 = ((dynamicTime - cached200Time) / dynamicTime * 100).toFixed(2);
const gain304 = ((dynamicTime - cached304Time) / dynamicTime * 100).toFixed(2);

console.log(`\nEstimated Performance Gain (200 OK): ${gain200}% faster`);
console.log(`Estimated Performance Gain (304 Not Modified): ${gain304}% faster`);
