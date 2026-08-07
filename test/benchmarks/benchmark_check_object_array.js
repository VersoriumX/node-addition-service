const { performance } = require('perf_hooks');

// The original checkObject logic before optimization
function currentCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (currentCheckValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (currentCheckValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (currentCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

function currentCheckValue(val) {
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

// Optimized checkObject logic
function optimizedCheckObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    if (Array.isArray(obj)) {
        const len = obj.length;
        for (let i = 0; i < len; i++) {
            const val = obj[i];
            if (typeof val === 'string') {
                if (currentCheckValue(val)) return true;
            } else if (typeof val === 'object' && val !== null) {
                if (optimizedCheckObject(val, depth + 1)) return true;
            }
        }
        return false;
    }

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (currentCheckValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (currentCheckValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (optimizedCheckObject(val, depth + 1)) return true;
        }
    }
    return false;
}

const ITERATIONS = 1000000; // 1 million iterations

const testPayload = {
    userId: 12345,
    roles: ['admin', 'editor', 'viewer', 'guest', 'api_user'],
    meta: {
        tags: ['important', 'security', 'frequent', 'backend', 'v2']
    }
};

console.log('--- Benchmarking checkObject with Arrays ---');

// Warm up
for (let i = 0; i < 20000; i++) {
    currentCheckObject(testPayload);
    optimizedCheckObject(testPayload);
}

const startCurrent = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    currentCheckObject(testPayload);
}
const endCurrent = performance.now();
const currentTime = endCurrent - startCurrent;

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    optimizedCheckObject(testPayload);
}
const endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;

const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
console.log(`Current:   ${currentTime.toFixed(2)}ms`);
console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
console.log(`Speedup:   ${speedup.toFixed(2)}% faster\n`);
