/**
 * Electric Fence Security Middleware
 * Designed to detect and quarantine potential ReDoS payloads and bad actors.
 */

const quarantinedIPs = new Set();

// 🛡️ Sentinel Security Enhancement: Lightweight in-memory Rate Limiter
// Enforces a limit of 100 requests per window (1 minute) per IP.
const ipRequestCounts = new Map();
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function apiRateLimiter(req, res, next) {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
    const now = Date.now();

    // 🛡️ Sentinel Defense-In-Depth: Periodically prune stale entries to prevent memory exhaustion
    if (ipRequestCounts.size > 2000) {
        for (const [key, val] of ipRequestCounts.entries()) {
            if (now - val.startTime >= LIMIT_WINDOW_MS) {
                ipRequestCounts.delete(key);
            }
        }
    }

    let record = ipRequestCounts.get(ip);
    if (!record || (now - record.startTime >= LIMIT_WINDOW_MS)) {
        record = {
            startTime: now,
            count: 0
        };
        ipRequestCounts.set(ip, record);
    }

    record.count++;

    const remaining = Math.max(0, MAX_REQUESTS - record.count);
    const resetTime = Math.ceil((record.startTime + LIMIT_WINDOW_MS - now) / 1000);

    if (res.setHeader) {
        res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', resetTime);
    }

    if (record.count > MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests, please try again later.'
        });
    }

    next();
}

/**
 * ⚡ Bolt Optimization:
 * Moved checkValue outside the middleware to prevent redeclaration on every request.
 */
function checkValue(val) {
    if (typeof val === 'string') {
        // Simple length check - common ReDoS payloads are often very long
        if (val.length > 1000) return true;

        // ⚡ Bolt Optimization: Replace redundant includes() and indexOf() scans
        // with a single-pass indexOf() loop. This completely avoids double-scanning the string
        // for incoming request query and body payloads, improving speed and efficiency.
        let pos = val.indexOf('**');
        if (pos !== -1) {
            let count = 1;
            pos = val.indexOf('**', pos + 2);
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
        // 🛡️ Sentinel Security Enhancement: Scan object keys as well as values
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

module.exports = { electricFence, securityMiddleware: electricFence, quarantinedIPs, apiRateLimiter, ipRequestCounts };
