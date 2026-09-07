const { performance } = require('perf_hooks');

// Legacy checkValue implementation (without length < 6 fast path)
function checkValueLegacy(val) {
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

// Optimized checkValue implementation (with length < 6 fast path)
function checkValueOptimized(val) {
    if (typeof val === 'string') {
        if (val.length < 6) return false;
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

const sampleInputs = [
    'a', 'b', 'name', 'value', '10', '20', 'text', 'id', 'status', 'ok',
    'BTC', 'USD', 'a_long_key_name_that_is_over_6_chars', 'normal_value_string'
];

const ITERATIONS = 10000000;

console.log(`Running checkValue benchmark (${ITERATIONS.toLocaleString()} iterations per input set)...`);

// Benchmark Legacy
const startLegacy = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < sampleInputs.length; j++) {
        checkValueLegacy(sampleInputs[j]);
    }
}
const endLegacy = performance.now();
const legacyTime = endLegacy - startLegacy;

// Benchmark Optimized
const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (let j = 0; j < sampleInputs.length; j++) {
        checkValueOptimized(sampleInputs[j]);
    }
}
const endOptimized = performance.now();
const optimizedTime = endOptimized - startOptimized;

const percentageImprovement = (((legacyTime - optimizedTime) / legacyTime) * 100).toFixed(2);

console.log(`Legacy checkValue Execution Time:    ${legacyTime.toFixed(2)} ms`);
console.log(`Optimized checkValue Execution Time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Performance gain: ${percentageImprovement}% faster`);
