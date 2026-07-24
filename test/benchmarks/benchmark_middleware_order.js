const express = require('express');
const path = require('path');
const http = require('http');
const { performance } = require('perf_hooks');
const { electricFence } = require('../../src/security');

// Create the original app configuration
const appOriginal = express();
appOriginal.use(express.json());
appOriginal.use(electricFence);
appOriginal.use(express.static(path.join(__dirname, '../../public')));
appOriginal.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'robots.txt'));
});
appOriginal.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'VersoriumX.html'));
});

// Create the optimized app configuration
const appOptimized = express();
appOptimized.use(express.static(path.join(__dirname, '../../public')));
appOptimized.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'robots.txt'));
});
appOptimized.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'VersoriumX.html'));
});
appOptimized.use(express.json());
appOptimized.use(electricFence);

function runServer(app, port) {
    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}

function makeRequest(port, path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}${path}`, (res) => {
            res.resume(); // consume response body
            res.on('end', () => resolve());
        }).on('error', reject);
    });
}

async function runBenchmarkFor(port, path, iterations = 1000) {
    // Warm up
    for (let i = 0; i < 50; i++) {
        await makeRequest(port, path);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await makeRequest(port, path);
    }
    const end = performance.now();
    return end - start;
}

async function main() {
    console.log("--- Benchmarking Middleware Order Optimization ---");

    const portOrig = 3001;
    const portOpt = 3002;

    const serverOrig = await runServer(appOriginal, portOrig);
    const serverOpt = await runServer(appOptimized, portOpt);

    try {
        const iterations = 1000;
        console.log(`Running ${iterations} requests to /robots.txt...`);

        const timeOriginal = await runBenchmarkFor(portOrig, '/robots.txt', iterations);
        console.log(`Original order (json -> security -> static): ${timeOriginal.toFixed(2)}ms`);

        const timeOptimized = await runBenchmarkFor(portOpt, '/robots.txt', iterations);
        console.log(`Optimized order (static -> json -> security): ${timeOptimized.toFixed(2)}ms`);

        const diff = timeOriginal - timeOptimized;
        const speedup = (diff / timeOriginal) * 100;

        console.log(`\nEstimated Performance Gain: ${speedup.toFixed(2)}% faster`);
        console.log(`Time saved per 1,000 requests: ${diff.toFixed(2)}ms\n`);
    } finally {
        serverOrig.close();
        serverOpt.close();
    }
}

main().catch(console.error);
