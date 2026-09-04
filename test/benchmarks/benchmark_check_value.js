const { performance } = require('perf_hooks');

function currentCheckValue(val) {
    if (typeof val === 'string') {
        if (val.length > 1000) return true;

        if (val.includes('**')) {
            let count = 0;
            let pos = val.indexOf('**');
            while (pos !== -1) {
                count++;
                if (count > 2) return true;
                pos = val.indexOf('**', pos + 2);
            }
        }
    }
    return false;
}

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

const ITERATIONS = 2000000; // 2 million iterations

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

runBenchmark("id", "Short Key ('id')");
runBenchmark("name", "Short Key ('name')");
runBenchmark("Hello world, this is a standard string with no asterisks.", "No Asterisks");
runBenchmark("Hello world, this is a string with ** inside it once.", "One Asterisk pair");
runBenchmark("Hello world, this ** is a string ** with two asterisks.", "Two Asterisk pairs");
runBenchmark("Hello ** world, this ** is a string ** with three asterisks.", "Three Asterisk pairs (Short Circuit)");
