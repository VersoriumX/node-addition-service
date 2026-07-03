/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

function electricFence(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads (extremely long strings or suspicious patterns)
    const checkValue = (val) => {
        if (typeof val === 'string') {
            // Simple length check - common ReDoS payloads are often very long
            if (val.length > 1000) return true;
            // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
            if (val.includes('**') && (val.match(/\*\*/g) || []).length > 2) return true;
        }
        return false;
    };

    const isSuspicious = Object.values(req.query).some(checkValue) ||
                         Object.values(req.body).some(checkValue);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
