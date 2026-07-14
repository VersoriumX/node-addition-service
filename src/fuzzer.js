/**
 * Fuzzer service for generating test data variations.
 * This can be used to test the robustness of input fields.
 */

/**
 * ⚡ Bolt Optimization:
 * Pre-allocated lookup map for leet variations to avoid chained .replace() calls.
 */
const leetMap = {
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    'o': '0', 'O': '0'
};

function generateVariations(baseString) {
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");

    variations.add(baseString.split('').reverse().join(''));

    // ⚡ Bolt Optimization: Replace chained .replace() calls with single regex + lookup map
    const leet = baseString.replace(/[easo]/gi, m => leetMap[m]);
    variations.add(leet);

    return Array.from(variations);
}

module.exports = { generateVariations };
