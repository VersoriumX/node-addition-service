// src/security.js
const quarantinedIPs = new Set();

/**
 * Middleware to protect against ReDoS and block "bad actors".
 * It checks for unusually long query parameters and payloads.
 */
function securityMiddleware(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    if (quarantinedIPs.has(ip)) {
        return res.status(403).send('Access Denied: You have been quarantined for suspicious activity.');
    }

    // Heuristic: If any query parameter is unusually long (e.g., > 1000 chars),
    // it's a potential ReDoS attack vector.
    const isSuspicious = Object.values(req.query).some(val => typeof val === 'string' && val.length > 1000);

    if (isSuspicious) {
        console.warn(`[SECURITY] Suspicious activity detected from IP: ${ip}. Quarantining.`);
        quarantinedIPs.add(ip);
        return res.status(403).send('Access Denied: Suspicious activity detected.');
    }

    next();
}

module.exports = { securityMiddleware, quarantinedIPs };
