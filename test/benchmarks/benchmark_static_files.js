const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const rareearthHtmlPath = path.join(__dirname, '../../public/rareearth.html');
const isolationJsonPath = path.join(__dirname, '../../public/isolation.json');

console.log('--- Benchmarking Static File Reading vs In-Memory Cached serving with ETag ---');

// 1. Dynamic path (simulate res.sendFile style disk read or sync read)
function runDynamicRead() {
    // Read files dynamically from disk
    const rareearth = fs.readFileSync(rareearthHtmlPath, 'utf8');
    const isolation = fs.readFileSync(isolationJsonPath, 'utf8');
    // Calculate hash on the fly (Express does this if ETag is enabled)
    const etagRE = crypto.createHash('md5').update(rareearth).digest('hex');
    const etagIJ = crypto.createHash('md5').update(isolation).digest('hex');
    return { rareearth, isolation, etagRE, etagIJ };
}

// 2. Optimized path: Eagerly cached on startup
const rareearthHtmlCache = fs.readFileSync(rareearthHtmlPath);
const isolationJsonCache = fs.readFileSync(isolationJsonPath);
const rareearthHtmlETag = `"${crypto.createHash('md5').update(rareearthHtmlCache).digest('hex')}"`;
const isolationJsonETag = `"${crypto.createHash('md5').update(isolationJsonCache).digest('hex')}"`;

function runCachedCheck(headers = {}) {
    // Check if-none-match header
    if (headers['if-none-match'] === rareearthHtmlETag) {
        return { status: 304 };
    }
    return { status: 200, body: rareearthHtmlCache, etag: rareearthHtmlETag };
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
    runCachedCheck({ 'if-none-match': rareearthHtmlETag }); // 304 response
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
