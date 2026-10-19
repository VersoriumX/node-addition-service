const { performance } = require('perf_hooks');

const tokens = Object.assign(Object.create(null), { GoldX: 1800, SilverX: 25, Copper: 4 });
const SENSITIVE_KEYS = ['__proto__', 'constructor', 'prototype'];

// Unoptimized implementations
function getTokenValueOld(name) {
    if (!name || typeof name !== 'string') return null;
    return tokens[name] !== undefined ? tokens[name] : null;
}

function isSensitiveKeyOld(name) {
    return SENSITIVE_KEYS.includes(name);
}

// Optimized implementations
function getTokenValueNew(name) {
    if (!name || typeof name !== 'string') return null;
    const val = tokens[name];
    return val !== undefined ? val : null;
}

function isSensitiveKeyNew(name) {
    return name === '__proto__' || name === 'constructor' || name === 'prototype';
}

const ITERATIONS = 5000000;

console.log('--- Benchmarking Token Manager Lookups & Sensitive Key Checks ---');

// Warmup
for (let i = 0; i < 10000; i++) {
    getTokenValueOld('GoldX');
    getTokenValueNew('GoldX');
    isSensitiveKeyOld('GoldX');
    isSensitiveKeyNew('GoldX');
}

// 1. getTokenValue
console.log(`\n1. getTokenValue (${ITERATIONS.toLocaleString()} iterations)`);
const startLookupOld = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    getTokenValueOld('GoldX');
    getTokenValueOld('NonExistent');
}
const endLookupOld = performance.now();
const lookupOldTime = endLookupOld - startLookupOld;

const startLookupNew = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    getTokenValueNew('GoldX');
    getTokenValueNew('NonExistent');
}
const endLookupNew = performance.now();
const lookupNewTime = endLookupNew - startLookupNew;

const lookupSpeedup = ((lookupOldTime - lookupNewTime) / lookupOldTime) * 100;
console.log(`Unoptimized (double property lookup): ${lookupOldTime.toFixed(2)}ms`);
console.log(`Optimized (single property lookup):   ${lookupNewTime.toFixed(2)}ms`);
console.log(`Speedup:                             ${lookupSpeedup.toFixed(2)}% faster`);

// 2. Sensitive key validation
console.log(`\n2. Sensitive Key Check (${ITERATIONS.toLocaleString()} iterations)`);
const startSensOld = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    isSensitiveKeyOld('GoldX');
    isSensitiveKeyOld('constructor');
}
const endSensOld = performance.now();
const sensOldTime = endSensOld - startSensOld;

const startSensNew = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    isSensitiveKeyNew('GoldX');
    isSensitiveKeyNew('constructor');
}
const endSensNew = performance.now();
const sensNewTime = endSensNew - startSensNew;

const sensSpeedup = ((sensOldTime - sensNewTime) / sensOldTime) * 100;
console.log(`Unoptimized (Array.includes):        ${sensOldTime.toFixed(2)}ms`);
console.log(`Optimized (direct string comparison): ${sensNewTime.toFixed(2)}ms`);
console.log(`Speedup:                             ${sensSpeedup.toFixed(2)}% faster`);
