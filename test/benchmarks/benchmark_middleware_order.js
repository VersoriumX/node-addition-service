const express = require('express');
const path = require('path');
const http = require('http');
const { performance } = require('perf_hooks');
const { electricFence } = require('../../src/security');

// Create Unoptimized App (Old Order)
const appOld = express();
appOld.use(express.json());
appOld.use(electricFence);
appOld.use(express.static(path.join(__dirname, '../../public')));

// Create Optimized App (New Order)
const appNew = express();
appNew.use(express.static(path.join(__dirname, '../../public')));
appNew.use(express.json());
appNew.use(electricFence);

const agent = new http.Agent({ keepAlive: true, maxSockets: 100 });

// Helper to make a request and return a promise
function makeRequest(port, pathStr) {
    return new Promise((resolve, reject) => {
        const req = http.get({
            hostname: '127.0.0.1',
            port: port,
            path: pathStr,
            agent: agent
        }, (res) => {
            res.resume();
            res.on('end', resolve);
        });
        req.on('error', reject);
    });
}

async function runBenchmarkForServer(port, iterations, pathStr) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await makeRequest(port, pathStr);
    }
    const end = performance.now();
    return end - start;
}

async function run() {
    const portOld = 4001;
    const portNew = 4002;
    const iterations = 1000;

    const serverOld = appOld.listen(portOld);
    const serverNew = appNew.listen(portNew);

    try {
        // Warm up connections
        await makeRequest(portOld, '/robots.txt');
        await makeRequest(portNew, '/robots.txt');

        console.log(`--- Benchmarking Middleware Order Optimization (${iterations} requests) ---`);

        const oldTime = await runBenchmarkForServer(portOld, iterations, '/robots.txt');
        console.log(`Original Order (Middleware -> Static): ${oldTime.toFixed(4)}ms`);

        const newTime = await runBenchmarkForServer(portNew, iterations, '/robots.txt');
        console.log(`Optimized Order (Static -> Middleware): ${newTime.toFixed(4)}ms`);

        const speedup = ((oldTime - newTime) / oldTime) * 100;
        console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
        console.log(`Time saved per ${iterations} requests: ${(oldTime - newTime).toFixed(2)}ms`);
    } catch (err) {
        console.error('Error during benchmark:', err);
    } finally {
        serverOld.close();
        serverNew.close();
        agent.destroy();
    }
}

run();
