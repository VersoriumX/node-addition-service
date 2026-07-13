/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * 🛡️ Sentinel Security Enhancement:
 * Recursively inspects objects for suspicious patterns with a depth limit.
 * Optimized for performance by using manual loops instead of Object.values().
 */
function checkObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const val = obj[key];
        if (typeof val === 'string') {
            // Simple length check - common ReDoS payloads are often very long
            if (val.length > 1000) return true;

            // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
            // ⚡ Bolt Optimization: Use indexOf for manual counting to avoid regex overhead.
            if (val.indexOf('**') !== -1) {
                let count = 0;
                let pos = val.indexOf('**');
                while (pos !== -1) {
                    count++;
                    if (count > 2) return true;
                    pos = val.indexOf('**', pos + 2);
                }
            }
        } else if (typeof val === 'object' && val !== null) {
            if (checkObject(val, depth + 1)) return true;
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
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
