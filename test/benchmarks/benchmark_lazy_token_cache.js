const crypto = require('crypto');

// Benchmark comparing Eager Cache Update vs Lazy Cache Invalidation on Token Mutations

const tokensEager = {};
let eagerJSONCache = null;
let eagerETagCache = null;

function updateEagerCache() {
    const keys = Object.keys(tokensEager);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokensEager[name] };
    }
    eagerJSONCache = JSON.stringify(arr);
    eagerETagCache = `"${crypto.createHash('md5').update(eagerJSONCache).digest('hex')}"`;
}

function addTokenEager(name, value) {
    tokensEager[name] = value;
    updateEagerCache();
}

const tokensLazy = {};
let lazyJSONCache = null;
let lazyETagCache = null;

function invalidateLazyCache() {
    lazyJSONCache = null;
    lazyETagCache = null;
}

function updateLazyCache() {
    const keys = Object.keys(tokensLazy);
    const arr = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        arr[i] = { name, value: tokensLazy[name] };
    }
    lazyJSONCache = JSON.stringify(arr);
    lazyETagCache = `"${crypto.createHash('md5').update(lazyJSONCache).digest('hex')}"`;
}

function addTokenLazy(name, value) {
    tokensLazy[name] = value;
    invalidateLazyCache();
}

function getLazyJSON() {
    if (lazyJSONCache === null) updateLazyCache();
    return lazyJSONCache;
}

const iterations = 5000;

console.time('Eager Cache Mutations (5,000 adds)');
for (let i = 0; i < iterations; i++) {
    addTokenEager(`token_${i}`, i);
}
console.timeEnd('Eager Cache Mutations (5,000 adds)');

console.time('Lazy Cache Mutations (5,000 adds)');
for (let i = 0; i < iterations; i++) {
    addTokenLazy(`token_${i}`, i);
}
console.timeEnd('Lazy Cache Mutations (5,000 adds)');

console.time('Lazy Cache Read (Single Read)');
getLazyJSON();
console.timeEnd('Lazy Cache Read (Single Read)');
