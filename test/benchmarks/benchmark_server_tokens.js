const tokenmanager = require('../../src/tokenmanager');
const { isETagMatch } = require('../../index');

const iterations = 100000;

console.log(`Running benchmark for GET /api/tokens performance (${iterations} iterations)...`);

// Standard unoptimized handler: mapping keys and JSON.stringify on every request
function unoptimizedHandler() {
    try {
        const tokens = tokenmanager.getAllTokens();
        const tokenArray = Object.keys(tokens).map(name => ({ name, value: tokens[name] }));
        return JSON.stringify(tokenArray);
    } catch (error) {
        return null;
    }
}

// Optimized handler: pre-serialized JSON and ETag checking
function optimizedHandler(reqHeader) {
    try {
        const etag = tokenmanager.getAllTokensETag();

        if (isETagMatch(reqHeader, etag)) {
            return 304;
        }

        return tokenmanager.getAllTokensJSON();
    } catch (error) {
        return null;
    }
}

// Benchmark 1: Unoptimized
console.time('Unoptimized GET /api/tokens (mapping + stringify)');
for (let i = 0; i < iterations; i++) {
    unoptimizedHandler();
}
console.timeEnd('Unoptimized GET /api/tokens (mapping + stringify)');

// Benchmark 2: Optimized (Full JSON cache hit)
console.time('Optimized GET /api/tokens (pre-serialized JSON)');
for (let i = 0; i < iterations; i++) {
    optimizedHandler(null);
}
console.timeEnd('Optimized GET /api/tokens (pre-serialized JSON)');

// Benchmark 3: Optimized (304 Not Modified via ETag)
const cachedETag = tokenmanager.getAllTokensETag();
console.time('Optimized GET /api/tokens (304 Not Modified ETag match)');
for (let i = 0; i < iterations; i++) {
    optimizedHandler(cachedETag);
}
console.timeEnd('Optimized GET /api/tokens (304 Not Modified ETag match)');
