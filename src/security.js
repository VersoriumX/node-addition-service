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
 * This ensures that nested payloads (common in Express) are properly scanned.
 * Depth limit of 10 to prevent stack overflow.
 */
function checkObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return false;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        // 🛡️ Sentinel Security Enhancement: Check both the key and the value for suspicious patterns.
        if (checkValue(key)) return true;

        const val = obj[key];
        if (typeof val === 'string') {
            if (checkValue(val)) return true;
        } else if (typeof val === 'object' && val !== null) {
            if (checkObject(val, depth + 1)) return true;
        }
    }
    return false;
}

function electricFence(req, res, next) {
    // 🛡️ Sentinel Security Enhancement: Add standard security headers for defense-in-depth
    if (res.setHeader) {
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline';");
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    const ip = req.ip || (req.socket && req.socket.remoteAddress);

    if (quarantinedIPs.has(ip)) {
        return res.status(403).json({ error: "Access Denied: IP Quarantined." });
    }

    // Inspect query and body for potential ReDoS payloads
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
