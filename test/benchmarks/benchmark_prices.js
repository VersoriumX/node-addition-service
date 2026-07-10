const http = require('http');
const { spawn } = require('child_process');

async function runBenchmark() {
    console.log('--- Benchmarking Price API Optimization ---');

    // Start the server
    const server = spawn('node', ['index.js'], {
        env: { ...process.env, PORT: 3001, METALS_API_KEY: 'test', CRYPTO_API_KEY: 'test' }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    const makeRequest = (headers = {}) => {
        return new Promise((resolve, reject) => {
            const start = process.hrtime.bigint();
            const req = http.get('http://localhost:3001/api/prices/metals', { headers }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const end = process.hrtime.bigint();
                    resolve({
                        status: res.statusCode,
                        etag: res.headers.etag,
                        duration: Number(end - start) / 1000000 // ms
                    });
                });
            });
            req.on('error', reject);
        });
    };

    try {
        console.log('1. First request (populates cache)...');
        const first = await makeRequest();
        console.log(`   Status: ${first.status}, Duration: ${first.duration.toFixed(4)}ms, ETag: ${first.etag}`);

        console.log('2. Second request (uses pre-serialized cache)...');
        const second = await makeRequest();
        console.log(`   Status: ${second.status}, Duration: ${second.duration.toFixed(4)}ms`);

        console.log('3. Third request (Conditional GET with ETag)...');
        const third = await makeRequest({ 'if-none-match': first.etag });
        console.log(`   Status: ${third.status}, Duration: ${third.duration.toFixed(4)}ms (Expected 304)`);

        if (third.status === 304) {
            const gain = ((second.duration - third.duration) / second.duration * 100).toFixed(2);
            console.log(`\nRESULT: 304 Not Modified optimization provides ~${gain}% additional speedup over cached JSON.`);
        }

    } catch (err) {
        console.error('Benchmark failed:', err);
    } finally {
        server.kill();
    }
}

runBenchmark();
