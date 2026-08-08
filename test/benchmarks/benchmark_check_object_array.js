const { performance } = require('perf_hooks');

// Helper to check strings for suspicious patterns (original implementation)
function checkValue(val) {
    if (typeof val === 'string') {
        if (val.length > 1000) return true;

        let pos = val.indexOf('**');
        if (pos !== -1) {
            let count = 1;
            pos = val.indexOf('**', pos + 2);
            while (pos !== -1) {
                count++;
                if (count > 2) return true;
                pos = val.indexOf('**', pos + 2);
            }
        }
    }
    return false;
}

// 1. Current checkObject implementation (without explicit array checks)
function currentCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (checkValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (currentCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

// 2. Optimized checkObject implementation (with explicit array check)
function optimizedCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    if (Array.isArray(obj)) {
        const len = obj.length;
        for (let i = 0; i < len; i++) {
            const val = obj[i];
            if (typeof val === 'string') {
                if (checkValue(val)) return true;
            } else if (typeof val === 'object' && val !== null) {
                if (optimizedCheckObject(val, depth + 1)) return true;
            }
        }
        return false;
    }

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (checkValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (optimizedCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

const ITERATIONS = 1000000; // 1 million iterations

function runBenchmark() {
    // Construct sample arrays
    const simpleArray = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];
    const nestedArray = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' }
    ];

    console.log('--- Benchmarking checkObject Array Optimization (1,000,000 iterations) ---');

    // Warm up
    for (let i = 0; i < 10000; i++) {
        currentCheckObject(simpleArray);
        optimizedCheckObject(simpleArray);
        currentCheckObject(nestedArray);
        optimizedCheckObject(nestedArray);
    }

    // Benchmark 1: Simple String Array
    console.log('\nScenario 1: Simple String Array');
    const startCurrent1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentCheckObject(simpleArray);
    }
    const endCurrent1 = performance.now();
    const timeCurrent1 = endCurrent1 - startCurrent1;

    const startOptimized1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedCheckObject(simpleArray);
    }
    const endOptimized1 = performance.now();
    const timeOptimized1 = endOptimized1 - startOptimized1;

    const speedup1 = ((timeCurrent1 - timeOptimized1) / timeCurrent1) * 100;
    console.log(`Current (for...in):     ${timeCurrent1.toFixed(2)}ms`);
    console.log(`Optimized (for loop):   ${timeOptimized1.toFixed(2)}ms`);
    console.log(`Speedup:                ${speedup1.toFixed(2)}% faster`);

    // Benchmark 2: Array of Objects
    console.log('\nScenario 2: Array of Objects');
    const startCurrent2 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentCheckObject(nestedArray);
    }
    const endCurrent2 = performance.now();
    const timeCurrent2 = endCurrent2 - startCurrent2;

    const startOptimized2 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedCheckObject(nestedArray);
    }
    const endOptimized2 = performance.now();
    const timeOptimized2 = endOptimized2 - startOptimized2;

    const speedup2 = ((timeCurrent2 - timeOptimized2) / timeCurrent2) * 100;
    console.log(`Current (for...in):     ${timeCurrent2.toFixed(2)}ms`);
    console.log(`Optimized (for loop):   ${timeOptimized2.toFixed(2)}ms`);
    console.log(`Speedup:                ${speedup2.toFixed(2)}% faster\n`);
}

runBenchmark();
