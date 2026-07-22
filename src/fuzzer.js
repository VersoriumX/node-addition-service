/**
 * Fuzzer service for generating test data variations.
 * This can be used to test the robustness of input fields.
 */

/**
 * ⚡ Bolt Optimization: Hoisted leetMap and regex outside the function to avoid
 * re-allocation on every call.
 */
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

    // ⚡ Bolt Optimization: Replace chained .replace() calls with a single-pass regex
    // and a pre-allocated map to avoid multiple string traversals and temporary allocations.
    const leet = baseString.replace(LEET_REGEX, m => LEET_MAP[m] ?? m);
    variations.add(leet);

    return Array.from(variations);
}

module.exports = { generateVariations };
