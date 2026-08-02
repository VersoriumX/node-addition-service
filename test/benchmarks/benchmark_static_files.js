const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const ITERATIONS = 10000;
const rareearthPath = path.join(__dirname, '../../public/rareearth.html');
const isolationPath = path.join(__dirname, '../../public/isolation.json');

console.log('--- Benchmarking Static File serving for rareearth.html and isolation.json ---');

// 1. Simulate express.static behaviour (file reads and hash generation)
function runStaticExpress() {
    const rareearth = fs.readFileSync(rareearthPath, 'utf8');
    const isolation = fs.readFileSync(isolationPath, 'utf8');
    const etagR = crypto.createHash('md5').update(rareearth).digest('hex');
    const etagI = crypto.createHash('md5').update(isolation).digest('hex');
    return { rareearth, isolation, etagR, etagI };
}

// 2. Optimized path: Eagerly cached on startup
const rareearthCache = fs.readFileSync(rareearthPath);
const isolationCache = fs.readFileSync(isolationPath);
const rareearthETag = `"${crypto.createHash('md5').update(rareearthCache).digest('hex')}"`;
const isolationETag = `"${crypto.createHash('md5').update(isolationCache).digest('hex')}"`;

function runCachedCheck(headers = {}) {
    let resultRare, resultIso;
    if (headers['if-none-match-rare'] === rareearthETag) {
        resultRare = { status: 304 };
    } else {
        resultRare = { status: 200, body: rareearthCache, etag: rareearthETag };
    }

    if (headers['if-none-match-iso'] === isolationETag) {
        resultIso = { status: 304 };
    } else {
        resultIso = { status: 200, body: isolationCache, etag: isolationETag };
    }
    return { resultRare, resultIso };
}

const startStatic = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runStaticExpress();
}
const endStatic = performance.now();
const staticTime = endStatic - startStatic;

const startCached200 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck({});
}
const endCached200 = performance.now();
const cached200Time = endCached200 - startCached200;

const startCached304 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runCachedCheck({ 'if-none-match-rare': rareearthETag, 'if-none-match-iso': isolationETag });
}
const endCached304 = performance.now();
const cached304Time = endCached304 - startCached304;

console.log(`express.static style reads + hashing: ${staticTime.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`In-Memory Cached (200 OK): ${cached200Time.toFixed(4)}ms for ${ITERATIONS} iterations`);
console.log(`In-Memory Cached (304 Not Modified): ${cached304Time.toFixed(4)}ms for ${ITERATIONS} iterations`);

const gain200 = ((staticTime - cached200Time) / staticTime * 100).toFixed(2);
const gain304 = ((staticTime - cached304Time) / staticTime * 100).toFixed(2);

console.log(`\nEstimated Performance Gain (200 OK): ${gain200}% faster`);
console.log(`Estimated Performance Gain (304 Not Modified): ${gain304}% faster`);
