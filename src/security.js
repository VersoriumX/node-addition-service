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
/**
 * 🛡️ Sentinel Security Enhancement:
 * Recursively inspects objects for suspicious patterns.
 * Optimized for performance by using manual loops instead of Object.values().
 * This ensures that nested payloads (common in Express) are properly scanned.
 */
function checkObject(obj) {
    if (!obj || typeof obj !== 'object') return false;
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
};
}

function electricFence(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Inspect query and body for potential ReDoS payloads (extremely long strings or suspicious patterns)
    // ⚡ Bolt Optimization: Manual loop to avoid Object.values() array allocation and some() overhead.
    const isSuspicious = checkObject(req.query) || checkObject(req.body);
        const val = obj[key];
        if (typeof val === 'string') {
            // Simple length check - common ReDoS payloads are often very long
            if (val.length > 1000) return true;

            // Check for suspicious globstar patterns that trigger ReDoS in older minimatch
            // ⚡ Bolt Optimization: Using indexOf instead of regex match for better performance
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
    const isSuspicious = checkObject(req.query) || checkObject(req.body);
    // ⚡ Bolt Optimization: Replace Object.values().some() with manual loops
    // to avoid intermediate array allocation and improve performance.
    let isSuspicious = false;

    if (req.query) {
        for (const key in req.query) {
            if (Object.prototype.hasOwnProperty.call(req.query, key)) {
                if (checkValue(req.query[key])) {
                    isSuspicious = true;
                    break;
                }
            }
        }
    }

    if (!isSuspicious && req.body) {
        for (const key in req.body) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                if (checkValue(req.body[key])) {
                    isSuspicious = true;
                    break;
                }
            }
        }
    }

    if (isSuspicious) {
        console.warn(`Suspicious activity detected from IP: ${ip}. Quarantining actor.`);
        quarantinedIPs.add(ip);
        return res.status(403).json({ error: "Security Violation: Suspicious payload detected." });
    }

    next();
}

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs };
