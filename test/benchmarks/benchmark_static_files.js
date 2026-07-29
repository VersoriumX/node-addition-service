const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const rareearthHtmlPath = path.join(__dirname, '../../public/rareearth.html');
const isolationJsonPath = path.join(__dirname, '../../public/isolation.json');

console.log('--- Benchmarking In-Memory Cached Static Files vs Dynamic Disk serving ---');

// 1. Dynamic serving style (simulated read and hash on the fly)
function runDynamicRead() {
    const rareearth = fs.readFileSync(rareearthHtmlPath, 'utf8');
    const isolation = fs.readFileSync(isolationJsonPath, 'utf8');
    const etagR = crypto.createHash('md5').update(rareearth).digest('hex');
    const etagI = crypto.createHash('md5').update(isolation).digest('hex');
    return { rareearth, isolation, etagR, etagI };
}

// 2. Optimized path (Our in-memory cached content and pre-calculated ETags)
const rareearthContent = fs.readFileSync(rareearthHtmlPath);
const isolationContent = fs.readFileSync(isolationJsonPath);
const rareearthETag = `"${crypto.createHash('md5').update(rareearthContent).digest('hex')}"`;
const isolationETag = `"${crypto.createHash('md5').update(isolationContent).digest('hex')}"`;

function isETagMatch(reqHeader, etag) {
    if (!reqHeader) return false;
    if (reqHeader === etag) return true;
    const cleanHeader = reqHeader.startsWith('W/') ? reqHeader.slice(2) : reqHeader;
    const cleanETag = etag.startsWith('W/') ? etag.slice(2) : etag;
    if (cleanHeader === cleanETag) return true;
    return cleanHeader.includes(cleanETag);
}

function runCachedCheck(headers = {}, type = 'html') {
    const etag = type === 'html' ? rareearthETag : isolationETag;
    const content = type === 'html' ? rareearthContent : isolationContent;

    if (isETagMatch(headers['if-none-match'], etag)) {
        return { status: 304 };
    }
    return { status: 200, body: content, etag: etag };
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
    runCachedCheck({}, 'html');
    runCachedCheck({}, 'json');
}
const endCached200 = performance.now();
const cached200Time = endCached200 - startCached200;

const startCached304 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck({ 'if-none-match': rareearthETag }, 'html');
    runCachedCheck({ 'if-none-match': isolationETag }, 'json');
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
