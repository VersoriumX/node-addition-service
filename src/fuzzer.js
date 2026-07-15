/**
 * Fuzzer service for generating test data variations.
 * This can be used to test the robustness of input fields.
 */

// ⚡ Bolt Optimization: Pre-allocated map and hoisted regex to avoid repeated allocations.
const LEET_MAP = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};
const LEET_REGEX = /[easo]/gi;

function generateVariations(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(baseString.split('').reverse().join(''));

    // ⚡ Bolt Optimization: Use a single-pass regex replacement with a pre-allocated map
    // to reduce string allocations and scans compared to chained .replace() calls.
    let leet = baseString.replace(LEET_REGEX, m => LEET_MAP[m]);
    variations.add(leet);

    return Array.from(variations);
}

module.exports = { generateVariations };
