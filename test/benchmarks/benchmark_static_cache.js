const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const robotsPath = path.join(__dirname, '../../public/robots.txt');
const indexHtmlPath = path.join(__dirname, '../../public/VersoriumX.html');

console.log('--- Benchmarking Static File Reading vs In-Memory Cached serving with ETag ---');

// 1. Dynamic path (simulate res.sendFile style disk read or sync read)
function runDynamicRead() {
    // Read files dynamically from disk
    const robots = fs.readFileSync(robotsPath, 'utf8');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    // Calculate hash on the fly (Express does this if ETag is enabled)
    const etagR = crypto.createHash('md5').update(robots).digest('hex');
    const etagI = crypto.createHash('md5').update(indexHtml).digest('hex');
    return { robots, indexHtml, etagR, etagI };
}

// 2. Optimized path: Eagerly cached on startup
const robotsCache = fs.readFileSync(robotsPath);
const indexHtmlCache = fs.readFileSync(indexHtmlPath);
const robotsETag = `"${crypto.createHash('md5').update(robotsCache).digest('hex')}"`;
const indexHtmlETag = `"${crypto.createHash('md5').update(indexHtmlCache).digest('hex')}"`;

function runCachedCheck(headers = {}) {
    // Check if-none-match header
    if (headers['if-none-match'] === indexHtmlETag) {
        return { status: 304 };
    }
    return { status: 200, body: indexHtmlCache, etag: indexHtmlETag };
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
    runCachedCheck({ 'if-none-match': indexHtmlETag }); // 304 response
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
