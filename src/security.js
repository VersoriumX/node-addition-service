/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * 🛡️ Sentinel Security Enhancement:
 * Recursively inspects objects for suspicious patterns.
 * Optimized for performance by using manual loops instead of Object.values().
 * This ensures that nested payloads (common in Express) are properly scanned.
 * Includes a depth limit to prevent stack overflow from circular references.
 */
function checkObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10 || ArrayBuffer.isView(obj)) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const val = obj[key];
        if (typeof val === 'string') {
            // Simple length check - common ReDoS payloads are often very long
            if (val.length > 1000) return true;

            // ⚡ Bolt Optimization: Replace regex match(/\*\*/g) with faster indexOf loop
            // for counting suspicious globstar patterns.
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
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress);

    if (ip && quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }
    }

    // Inspect query and body for potential ReDoS payloads
    // ⚡ Bolt Optimization: Manual loops and recursion avoid intermediate array allocation
    // and improve performance compared to Object.values().some().
    const isSuspicious = (req.query && checkObject(req.query)) || (req.body && checkObject(req.body));

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
