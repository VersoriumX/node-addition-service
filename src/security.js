/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * ⚡ Bolt Optimization:
 * Optimized the suspicious payload check by using manual loops instead of Object.values().some().
 * This avoids creating intermediate arrays and reduces function call overhead, making the
 * middleware significantly faster for every request.
 */
function isSuspiciousPayload(obj) {
    if (!obj) return false;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (typeof val === 'string') {
                // Simple length check - common ReDoS payloads are often very long
                if (val.length > 1000) return true;

                // ⚡ Bolt Optimization: Check for suspicious globstar patterns without match() or regex
                // Counts occurrences of '**' efficiently.
                if (val.indexOf('**') !== -1) {
                    let count = 0;
                    let pos = val.indexOf('**');
                    while (pos !== -1) {
                        count++;
                        if (count > 2) return true;
                        pos = val.indexOf('**', pos + 2);
                    }
                }
            }
        }
    }
    return false;
}

function electricFence(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    const isSuspicious = isSuspiciousPayload(req.query) || isSuspiciousPayload(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
