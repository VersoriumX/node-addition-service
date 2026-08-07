const { performance } = require('perf_hooks');

// 1. Original implementation without array optimization
function originalCheckValue(val) {
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

function originalCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (originalCheckValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (originalCheckValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (originalCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

// 2. Optimized implementation with array checking (as in src/security.js)
function optimizedCheckValue(val) {
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

function optimizedCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    if (Array.isArray(obj)) {
        const len = obj.length;
        for (let i = 0; i < len; i++) {
            const val = obj[i];
            if (typeof val === 'string') {
                if (optimizedCheckValue(val)) return true;
            } else if (typeof val === 'object' && val !== null) {
                if (optimizedCheckObject(val, depth + 1)) return true;
            }
        }
        return false;
    }

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (optimizedCheckValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (optimizedCheckValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (optimizedCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

const ITERATIONS = 100000; // 100k iterations

function runBenchmark(obj, scenarioName) {
    console.log(`--- Scenario: ${scenarioName} ---`);

    // Warm up
    for (let i = 0; i < 1000; i++) {
        originalCheckObject(obj);
        optimizedCheckObject(obj);
    }

    const startOriginal = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        originalCheckObject(obj);
    }
    const endOriginal = performance.now();
    const originalTime = endOriginal - startOriginal;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedCheckObject(obj);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((originalTime - optimizedTime) / originalTime) * 100;
    console.log(`Original:  ${originalTime.toFixed(2)}ms`);
    console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:   ${speedup.toFixed(2)}% faster\n`);
}

// Scenario 1: Small array of strings
const smallArray = ["apple", "banana", "orange", "grape"];
runBenchmark(smallArray, "Small Array of Safe Strings");

// Scenario 2: Large array of strings
const largeArray = Array.from({ length: 100 }, (_, i) => `item_${i}`);
runBenchmark(largeArray, "Large Array of Safe Strings");

// Scenario 3: Nested structure containing arrays
const nestedObj = {
    title: "Project Alpha",
    tags: ["security", "optimization", "performance"],
    contributors: [
        { name: "Bolt", role: "optimizer" },
        { name: "Sentinel", role: "security" }
    ],
    metadata: {
        versions: ["1.0", "1.1", "2.0"]
    }
};
runBenchmark(nestedObj, "Nested Structure with Arrays");
