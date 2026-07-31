const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 50000;
const rareEarthPath = path.join(__dirname, '../../public/rareearth.html');
const isolationPath = path.join(__dirname, '../../public/isolation.json');

console.log('--- Benchmarking Static Files (rareearth.html & isolation.json) Caching ---');

// 1. Dynamic Path
function runDynamicRead() {
    const rareEarth = fs.readFileSync(rareEarthPath);
    const isolation = fs.readFileSync(isolationPath);
    const etagRE = `"${crypto.createHash('md5').update(rareEarth).digest('hex')}"`;
    const etagI = `"${crypto.createHash('md5').update(isolation).digest('hex')}"`;
    return { rareEarth, isolation, etagRE, etagI };
}

// 2. Cached Path
const cachedRareEarth = fs.readFileSync(rareEarthPath);
const cachedIsolation = fs.readFileSync(isolationPath);
const rareEarthETag = `"${crypto.createHash('md5').update(cachedRareEarth).digest('hex')}"`;
const isolationETag = `"${crypto.createHash('md5').update(cachedIsolation).digest('hex')}"`;

function runCachedCheck200() {
    return { status: 200, body: cachedRareEarth, etag: rareEarthETag };
}

function runCachedCheck304(headers) {
    if (headers['if-none-match'] === rareEarthETag) {
        return { status: 304 };
    }
    return { status: 200, body: cachedRareEarth, etag: rareEarthETag };
}

// Warm-up
for (let i = 0; i < 1000; i++) {
    runDynamicRead();
    runCachedCheck200();
    runCachedCheck304({ 'if-none-match': rareEarthETag });
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
    runCachedCheck200();
}
const endCached200 = performance.now();
const cached200Time = endCached200 - startCached200;

const startCached304 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck304({ 'if-none-match': rareEarthETag });
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
