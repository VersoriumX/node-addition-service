const { performance } = require('perf_hooks');

// Before fast-path optimization
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

// Optimized with short-string fast path (< 6 chars)
function optimizedCheckValue(val) {
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

const ITERATIONS = 3000000; // 3 million iterations

function runBenchmark(val, scenarioName) {
    console.log(`--- Scenario: ${scenarioName} ---`);

    // Warm up
    for (let i = 0; i < 10000; i++) {
        currentCheckValue(val);
        optimizedCheckValue(val);
    }

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        currentCheckValue(val);
    }
    const endCurrent = performance.now();
    const currentTime = endCurrent - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedCheckValue(val);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
    console.log(`Current:   ${currentTime.toFixed(2)}ms`);
    console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:   ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark("a", "Short string ('a')");
runBenchmark("name", "Object key ('name')");
runBenchmark("12345", "5-char param ('12345')");
runBenchmark("Hello world, this is a standard string with no asterisks.", "Long string (No Asterisks)");
runBenchmark("Hello ** world, this ** is a string ** with three asterisks.", "Three Asterisk pairs (Malicious Payload)");
