const { performance } = require('perf_hooks');
const { electricFence } = require('../../src/security');

const ITERATIONS = 100000;

function benchmark(fn, name) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(4)}ms for ${ITERATIONS} iterations`);
    return end - start;
}

console.log('--- Benchmarking Middleware Pipeline Order Optimization ---');

// Simulated original path: static request runs express.json() and electricFence checks
const originalPathTime = benchmark(() => {
    // Simulated request for static file
    const req = {
        method: 'GET',
        url: '/',
        ip: '127.0.0.1',
        query: {},
        body: {}
    };
    const res = {
        headers: {},
        setHeader(name, val) {
            this.headers[name] = val;
        }
    };

    // Simulate express.json() (no-op for empty body but still runs through middleware)
    let bodyParsed = false;
    const jsonMiddleware = (req, res, next) => {
        // Mock payload parsing check/handling
        bodyParsed = true;
        next();
    };

    // Simulate electricFence execution
    let securityChecked = false;
    jsonMiddleware(req, res, () => {
        electricFence(req, res, () => {
            securityChecked = true;
        });
    });

    // Simulate static file delivery
    const content = '<html>VersoriumX</html>';
}, 'Original Path (Body-parser + Electric Fence Scanning)');

// Simulated optimized path: static request serves file directly, bypassing security scans and body parsers
const optimizedPathTime = benchmark(() => {
    const req = {
        method: 'GET',
        url: '/',
        ip: '127.0.0.1'
    };

    // Direct static file delivery (bypasses express.json and electricFence middleware)
    const content = '<html>VersoriumX</html>';
}, 'Optimized Path (Direct GET Route Serving)');

const gain = ((originalPathTime - optimizedPathTime) / originalPathTime * 100).toFixed(2);
console.log(`\nEstimated Performance Gain for Static/GET Requests: ${gain}% faster`);
console.log(`Time saved per 100k requests: ${(originalPathTime - optimizedPathTime).toFixed(2)}ms`);
