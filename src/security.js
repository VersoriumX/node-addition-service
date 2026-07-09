/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

// ⚡ Bolt Optimization: Helper moved outside to avoid redeclaration on every request.
const checkObject = (obj) => {
    if (!obj) return false;
    for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'string') {
            // Simple length check - common ReDoS payloads are often very long
            if (val.length > 1000) return true;

            // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
            // ⚡ Bolt Optimization: Use indexOf for manual counting to avoid regex overhead.
            let firstIdx = val.indexOf('**');
            if (firstIdx !== -1) {
                let secondIdx = val.indexOf('**', firstIdx + 2);
                if (secondIdx !== -1) {
                    let thirdIdx = val.indexOf('**', secondIdx + 2);
                    if (thirdIdx !== -1) return true;
                }
            }
        }
    }
    return false;
};

function electricFence(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads (extremely long strings or suspicious patterns)
    // ⚡ Bolt Optimization: Manual loop to avoid Object.values() array allocation and some() overhead.
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
