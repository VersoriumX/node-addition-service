/**
 * Fuzzer service for generating test data variations.
 * This can be used to test the robustness of input fields.
 */

function generateVariations(baseString) {
    if (typeof baseString !== 'string') {
        throw new TypeError('Input must be a string');
    }
    if (baseString.length > 250) {
        throw new RangeError('Input is too long (max 250 characters)');
    }
    const variations = new Set();
    variations.add(baseString);
    variations.add(baseString.toUpperCase());
    variations.add(baseString.toLowerCase());
    variations.add(baseString + "123");
    variations.add(baseString + "!");
    variations.add(baseString.split('').reverse().join(''));

    // Add some common "leet" variations
    let leet = baseString.replace(/e/gi, '3').replace(/a/gi, '4').replace(/s/gi, '5').replace(/o/gi, '0');
    variations.add(leet);

    return Array.from(variations);
}

module.exports = { generateVariations };
