const { fetchMetalPrices } = require('./src/api');
const Module = require('module');

// Monkeypatch node-fetch inside src/api.js
const originalRequire = Module.prototype.require;
let networkCalls = 0;

Module.prototype.require = function(path) {
    if (path === 'node-fetch') {
        return (url, options) => {
            networkCalls++;
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({ price: 100 }),
                        status: 200
                    });
                }, 100);
            });
        };
    }
    return originalRequire.apply(this, arguments);
};

// Re-require src/api to ensure it uses the monkeypatched fetch
delete require.cache[require.resolve('./src/api')];
const { fetchMetalPrices: fetchMetalPricesOptimized } = require('./src/api');

async function runBenchmark() {
    console.log('--- Benchmarking Request Coalescing in src/api.js ---');
    console.log('Starting 5 concurrent requests...');
    const start = Date.now();

    // Fire 5 concurrent requests
    await Promise.all([
        fetchMetalPricesOptimized(),
        fetchMetalPricesOptimized(),
        fetchMetalPricesOptimized(),
        fetchMetalPricesOptimized(),
        fetchMetalPricesOptimized()
    ]);

    const end = Date.now();
    console.log(`Finished in ${end - start}ms`);
    console.log(`Network calls made: ${networkCalls}`);

    if (networkCalls === 1) {
        console.log('✅ SUCCESS: Request coalescing is working. 5 requests resulted in 1 network call.');
    } else {
        console.log(`❌ FAILURE: Thundering Herd detected! 5 requests resulted in ${networkCalls} network calls.`);
        process.exit(1);
    }
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
