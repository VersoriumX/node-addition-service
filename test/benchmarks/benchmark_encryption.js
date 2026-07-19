const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

console.log('--- Benchmarking Encryption Module Load and Initialization ---');

// 1. Measure the module require time (including lazy key definition)
const startRequire = performance.now();
const encryption = require('../../src/encryption');
const endRequire = performance.now();
const requireTime = endRequire - startRequire;

console.log(`Time to require 'src/encryption.js' in-process: ${requireTime.toFixed(4)}ms`);

// 2. Measure first-time key generation latency (cold start)
const startColdCall = performance.now();
const encrypted = encryption.encrypt('Bolt');
const endColdCall = performance.now();
const coldCallTime = endColdCall - startColdCall;

console.log(`Cold start (first encryption call - key generation): ${coldCallTime.toFixed(4)}ms`);

// 3. Measure subsequent encryption calls (warm path)
const startWarmCall = performance.now();
const encrypted2 = encryption.encrypt('Bolt');
const endWarmCall = performance.now();
const warmCallTime = endWarmCall - startWarmCall;

console.log(`Warm path (subsequent encryption call): ${warmCallTime.toFixed(4)}ms`);

// 4. Run comparison of module require time using clean node processes
console.log('\nMeasuring total clean Node process require time for encryption module:');
const cleanStart = performance.now();
execSync('node -e "require(\'./src/encryption\')"');
const cleanEnd = performance.now();
const cleanRequireTime = cleanEnd - cleanStart;
console.log(`Clean Node process importing encryption module takes: ${cleanRequireTime.toFixed(4)}ms`);
