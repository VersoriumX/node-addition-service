/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

/**
 * 🛡️ Sentinel Security Enhancement:
 * Inspects objects for suspicious patterns using an iterative approach to prevent stack overflow.
 * Scans for strings longer than 1000 characters or containing more than two '**' patterns.
 */
function checkObject(initialObj) {
    if (!initialObj || typeof initialObj !== 'object') return false;

    const stack = [initialObj];
    const seen = new WeakSet();

    while (stack.length > 0) {
        const obj = stack.pop();

        if (seen.has(obj)) continue;
        seen.add(obj);

        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            const val = obj[key];

            if (typeof val === 'string') {
                // Simple length check - common ReDoS payloads are often very long
                if (val.length > 1000) return true;

                // Check for suspicious globstar patterns (**/**/**)
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
            } else if (val !== null && typeof val === 'object') {
                stack.push(val);
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
    const isSuspicious = checkObject(req.query) || checkObject(req.body);

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
