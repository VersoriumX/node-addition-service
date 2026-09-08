const { performance } = require('perf_hooks');

// Unoptimized checkValue without fast-path length check
function unoptimizedCheckValue(val) {
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

// Optimized checkValue with fast-path length check (if val.length < 6 return false)
function optimizedCheckValue(val) {
    if (typeof val === 'string') {
        if (val.length > 1000) return true;
        if (val.length < 6) return false;

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
        unoptimizedCheckValue(val);
        optimizedCheckValue(val);
    }

    const startUnoptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        unoptimizedCheckValue(val);
    }
    const endUnoptimized = performance.now();
    const unoptimizedTime = endUnoptimized - startUnoptimized;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimizedCheckValue(val);
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    const speedup = ((unoptimizedTime - optimizedTime) / unoptimizedTime) * 100;
    console.log(`Unoptimized: ${unoptimizedTime.toFixed(2)}ms`);
    console.log(`Optimized:   ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:     ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark("a", "Short String Key ('a')");
runBenchmark("name", "Short String Key ('name')");
runBenchmark("123", "Short String Value ('123')");
runBenchmark("Hello world, this is a standard string with no asterisks.", "No Asterisks (Long)");
runBenchmark("Hello world, this is a string with ** inside it once.", "One Asterisk pair");
runBenchmark("Hello world, this ** is a string ** with two asterisks.", "Two Asterisk pairs");
runBenchmark("Hello ** world, this ** is a string ** with three asterisks.", "Three Asterisk pairs (Short Circuit)");
