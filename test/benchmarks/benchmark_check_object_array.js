// Original checkObject and checkValue
function checkValueOriginal(val) {
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

function checkObjectOriginal(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (checkValueOriginal(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValueOriginal(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (checkObjectOriginal(val, depth + 1)) return true;
        }
    }
    return false;
}

// Optimized checkObject and checkValue
function checkValueOptimized(val) {
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

function checkObjectOptimized(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const val = obj[i];
            if (typeof val === 'string') {
                if (checkValueOptimized(val)) return true;
            } else if (typeof val === 'object' && val !== null) {
                if (checkObjectOptimized(val, depth + 1)) return true;
            }
        }
        return false;
    }

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (checkValueOptimized(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValueOptimized(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (checkObjectOptimized(val, depth + 1)) return true;
        }
    }
    return false;
}

// Prepare payload with arrays of strings and objects
const payload = {
    userId: "12345",
    tags: ["node", "express", "performance", "security", "optimization"],
    nestedArray: [
        { name: "item1", val: "ok" },
        { name: "item2", val: "fine" },
        { name: "item3", val: "good" }
    ]
};

const iterations = 500000;

console.log("--- Benchmarking checkObject with Array Payloads ---");

// Warm up
for (let i = 0; i < 10000; i++) {
    checkObjectOriginal(payload);
    checkObjectOptimized(payload);
}

const startOriginal = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    checkObjectOriginal(payload);
}
const endOriginal = process.hrtime.bigint();
const originalTime = Number(endOriginal - startOriginal) / 1000000;

const startOptimized = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    checkObjectOptimized(payload);
}
const endOptimized = process.hrtime.bigint();
const optimizedTime = Number(endOptimized - startOptimized) / 1000000;

const percentSpeedup = ((originalTime - optimizedTime) / originalTime) * 100;

console.log(`Original checkObject time:  ${originalTime.toFixed(2)}ms`);
console.log(`Optimized checkObject time: ${optimizedTime.toFixed(2)}ms`);
console.log(`Speedup:                    ${percentSpeedup.toFixed(2)}% faster`);
