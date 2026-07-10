/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * ⚡ Bolt Optimization:
 * Moved checkValue outside the middleware to prevent redeclaration on every request.
 * Uses manual loops and indexOf instead of regex to minimize overhead.
 */
function checkValue(val) {
    if (typeof val === 'string') {
        // Simple length check - common ReDoS payloads are often very long
        if (val.length > 1000) return true;

        // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
        // ⚡ Bolt Optimization: Replace regex match(/\*\*/g) with faster indexOf loop.
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

/**
 * 🛡️ Sentinel Security Enhancement:
 * Non-recursive, iterative logic for checkObject to prevent stack overflows.
 * Scans nested payloads (common in Express) for suspicious patterns.
 */
function checkObject(initialObj) {
    if (!initialObj || typeof initialObj !== 'object') return false;

    const stack = [initialObj];
    const visited = new WeakSet();

    while (stack.length > 0) {
        const obj = stack.pop();

        if (visited.has(obj)) continue;
        visited.add(obj);

        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            const val = obj[key];
            if (checkValue(val)) return true;

            if (val !== null && typeof val === 'object') {
                stack.push(val);
            }
        }
    }
    return false;
}

function electricFence(req, res, next) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress);

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads
    // ⚡ Bolt Optimization: Manual loop to avoid Object.values() array allocation.
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
