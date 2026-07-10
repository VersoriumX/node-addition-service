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
 * Recursively inspects objects for suspicious patterns.
 * Optimized for performance by using manual loops instead of Object.values().
 */
function checkObject(obj) {
    if (!obj || typeof obj !== 'object') return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (checkObject(val)) return true;
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
    // ⚡ Bolt Optimization: Replace Object.values().some() with manual loops
    // to avoid intermediate array allocation and improve performance.
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
