const { performance } = require('perf_hooks');

function checkValueWithoutEarlyReturn(val) {
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

function checkValueWithEarlyReturn(val) {
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

const ITERATIONS = 2000000;

function runBenchmark(val, scenarioName) {
    console.log(`--- Scenario: ${scenarioName} ---`);

    // Warm up
    for (let i = 0; i < 10000; i++) {
        checkValueWithoutEarlyReturn(val);
        checkValueWithEarlyReturn(val);
    }

    const startCurrent = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        checkValueWithoutEarlyReturn(val);
    }
    const currentTime = performance.now() - startCurrent;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        checkValueWithEarlyReturn(val);
    }
    const optimizedTime = performance.now() - startOptimized;

    const speedup = ((currentTime - optimizedTime) / currentTime) * 100;
    console.log(`Without Early Return: ${currentTime.toFixed(2)}ms`);
    console.log(`With Early Return:    ${optimizedTime.toFixed(2)}ms`);
    console.log(`Speedup:              ${speedup.toFixed(2)}% faster\n`);
}

runBenchmark("a", "Short Key (length 1)");
runBenchmark("page", "Short Key (length 4)");
runBenchmark("Hello world, this is a standard string with no asterisks.", "Long Safe String");
runBenchmark("Hello ** world, this ** is a string ** with three asterisks.", "Three Asterisk pairs (Short Circuit)");
