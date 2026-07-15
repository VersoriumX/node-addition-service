const iterations = 100000;
const input = "Sentinel-Bolt-Optimization-Test-String";

function original(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(baseString.split('').reverse().join(''));

    let leet = baseString.replace(/e/gi, '3').replace(/a/gi, '4').replace(/s/gi, '5').replace(/o/gi, '0');
    variations.add(leet);

    return Array.from(variations);
}

const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function optimized(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(baseString.split('').reverse().join(''));

    let leet = baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
    variations.add(leet);

    return Array.from(variations);
}

console.log("Running Original...");
let start = Date.now();
for (let i = 0; i < iterations; i++) {
    original(input);
}
let end = Date.now();
console.log(`Original: ${end - start}ms`);

console.log("Running Optimized...");
start = Date.now();
for (let i = 0; i < iterations; i++) {
    optimized(input);
}
end = Date.now();
console.log(`Optimized: ${end - start}ms`);
