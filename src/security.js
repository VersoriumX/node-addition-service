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
        // We look for 3 or more occurrences of '**' which is a typical ReDoS trigger for glob parsers.
        let firstIdx = val.indexOf('**');
        if (firstIdx !== -1) {
            let secondIdx = val.indexOf('**', firstIdx + 2);
            if (secondIdx !== -1) {
                let thirdIdx = val.indexOf('**', secondIdx + 2);
                if (thirdIdx !== -1) return true;
            }
        }
    }
    return false;
}

/**
 * 🛡️ Sentinel Security Enhancement:
 * Iteratively inspects objects for suspicious patterns to prevent stack overflows.
 * Optimized for performance by using manual loops instead of Object.values().
 */
function checkObject(obj) {
    if (!obj || typeof obj !== 'object') return false;

    const stack = [obj];
    while (stack.length > 0) {
        const current = stack.pop();
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const val = current[key];
                if (typeof val === 'string') {
                    if (checkValue(val)) return true;
                } else if (typeof val === 'object' && val !== null) {
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
    // ⚡ Bolt Optimization: Using iterative checkObject with manual loops
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
