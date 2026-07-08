/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * ⚡ Bolt Optimization:
 * Optimized string scanning for suspicious patterns.
 * Using indexOf() in a loop is faster than regex match() for simple substring counting.
 */
function countOccurrences(str, pattern) {
    let count = 0;
    let pos = str.indexOf(pattern);
    while (pos !== -1) {
        count++;
        pos = str.indexOf(pattern, pos + pattern.length);
    }
    return count;
}

/**
 * ⚡ Bolt Optimization:
 * Manual object property traversal to avoid array allocations from Object.values().
 * This improves performance and enables early short-circuiting.
 */
function isSuspiciousValue(val) {
    if (typeof val === 'string') {
        // Simple length check - common ReDoS payloads are often very long
        if (val.length > 1000) return true;
        // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
        if (val.includes('**') && countOccurrences(val, '**') > 2) return true;
    }
    return false;
}

function hasSuspiciousContent(obj) {
    if (!obj) return false;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (isSuspiciousValue(obj[key])) return true;
        }
    }
    return false;
}

function electricFence(req, res, next) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress);

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads
    const isSuspicious = hasSuspiciousContent(req.query) ||
                         hasSuspiciousContent(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
