/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * ⚡ Bolt Optimization:
 * Moved checkValue outside the middleware to prevent redeclaration on every request.
 */
function checkValue(val) {
    if (typeof val === 'string') {
        // Simple length check - common ReDoS payloads are often very long
        if (val.length > 1000) return true;

        // ⚡ Bolt Optimization: Replace regex match(/\*\*/g) with faster indexOf loop
        // for counting suspicious globstar patterns.
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
 * Iteratively inspects objects for suspicious patterns.
 * Optimized for performance by using manual loops instead of Object.values().
 * Non-recursive approach prevents stack overflows on deeply nested objects.
 */
function checkObject(obj) {
    if (!obj || typeof obj !== 'object') return false;

    const stack = [obj];
    const seen = new WeakSet();

    while (stack.length > 0) {
        const current = stack.pop();
        if (seen.has(current)) continue;
        seen.add(current);

        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const val = current[key];
                if (checkValue(val)) return true;
                if (val && typeof val === 'object') {
                    stack.push(val);
                }
            }
        }
    }
    return false;
}

function electricFence(req, res, next) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress);

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads
    // ⚡ Bolt Optimization: Iterative checkObject to avoid recursion overhead
    if (checkObject(req.query) || checkObject(req.body)) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
