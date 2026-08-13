# Sentinel's Journal

## 2025-05-14 - Prototype Pollution in Token Management
**Vulnerability:** Inherited properties like `constructor` and `toString` were accessible via the `/api/token` endpoint, and sensitive keys like `__proto__` could be added to the tokens object.
**Learning:** Standard JavaScript objects inherit from `Object.prototype`, making them susceptible to prototype-related attacks if user-supplied keys are not properly validated.
**Prevention:** Use `Object.create(null)` for data-storage objects to prevent property inheritance, and explicitly block sensitive keys like `__proto__`, `constructor`, and `prototype`.

## 2025-05-15 - Sensitive Data Leakage in Logs
**Vulnerability:** Sensitive API keys (`access_key`, `CMC_PRO_API_KEY`) were being logged to the console in plain text when external API requests failed.
**Learning:** Logging the full URL of failed requests is common for debugging but dangerous when credentials are passed as query parameters.
**Prevention:** Implement redaction for sensitive query parameters in centralized logging or fetch wrappers before outputting to logs.
## 2025-05-15 - Sensitive Data Leakage in Error Logs
**Vulnerability:** External API keys were leaked in application logs when `fetch` requests failed, as the full URL (including query parameters) was logged.
**Learning:** Logging entire URLs or raw error objects can inadvertently expose credentials. Even if the log message is sanitized, the error object itself might contain the original request details.
**Prevention:** Explicitly redact sensitive query parameters from URLs before logging and avoid logging raw error objects; log only `error.message` or carefully whitelist properties.

## 2025-05-16 - ReDoS Bypass via Nested Objects
**Vulnerability:** The `electricFence` middleware only inspected top-level properties of `req.body` and `req.query`, allowing malicious ReDoS payloads to bypass detection when placed in nested objects.
**Learning:** Express and other modern web frameworks often parse complex query strings or JSON bodies into nested objects. A "flat" security check is insufficient as it fails to inspect the full surface area of the request data.
**Prevention:** Implement recursive inspection for security middleware that scans request data, or enforce strict schema validation to prevent unexpected nesting.

## 2025-07-16 - Dependency Resolution Mismatch and ReDoS
**Vulnerability:** The application was forced to use an outdated version of `path-to-regexp` (0.1.12) via `package.json` resolutions, which is vulnerable to ReDoS and incompatible with Express 5.x's internal routing logic.
**Learning:** Forcing legacy versions of transitive dependencies to fix vulnerabilities can lead to runtime crashes if parent dependencies (like `router` in Express 5.x) have migrated to new major versions with breaking API changes.
**Prevention:** Always verify that dependency resolutions align with the requirements of the top-level packages and prefer upgrading parent packages when possible.

## 2026-07-23 - Unconstrained Inputs in Token Management
**Vulnerability:** Additions and updates to tokens were not restricted by size or number domain validation. This could lead to Denial of Service (DoS) via database file bloat and memory exhaustion from excessively large names, and JSON serialization anomalies from non-finite numerical values (e.g. `NaN` or `Infinity` being written as `null`).
**Learning:** Checking parameter type alone is insufficient for robust input validation. String size bounds must be explicitly checked, and numerical bounds/properties (such as being finite) must be enforced to prevent memory exhaustion and data corruption during JSON stringification.
**Prevention:** Always combine type checks with size bounds (`length <= limit`) and mathematical properties checks (`Number.isFinite`) on all user-controlled inputs.

## 2026-07-24 - Unconstrained Decryption Inputs (DoS)
**Vulnerability:** The RSA decryption service (`decrypt` in `src/encryption.js` and the `/api/decrypt` endpoint) accepted input ciphertexts of arbitrary lengths, posing a high CPU resource exhaustion (Denial of Service) risk on computationally expensive decryption tasks.
**Learning:** RSA decryption is highly CPU-intensive. Validating and constraining ciphertext length on the API and service layers (to <= 500 characters, sufficient for standard base64 2048-bit RSA ciphertexts) prevents malicious actors from launching CPU DoS attacks.
**Prevention:** Enforce strict size bounds on any input parsed by computationally expensive cryptographic algorithms.

## 2026-07-25 - Standard HTTP Security Headers and Leak Prevention
**Vulnerability:** The application did not set standard HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection), leaving the homepage and API routes vulnerable to Clickjacking, XSS, and MIME-sniffing. Additionally, malformed JSON body payloads caused Express's default error handler to leak stack traces and server-side folder structures in HTML responses.
**Learning:** Security middleware like `electricFence` is bypassed by highly optimized static handlers defined earlier in the middleware pipeline. Placing a global security headers middleware at the very top of the app stack ensures that all responses (including cached HTML/static assets) are fully secured. Likewise, registering a global error-handling middleware at the very bottom catches internal SyntaxError exceptions from parsed JSON and prevents raw stack trace leakages.
**Prevention:** Always deploy security headers globally at the absolute top of the middleware stack and configure a robust global error-handling middleware to intercept syntax parsing failures gracefully.

## 2026-07-26 - ReDoS Key Injection Vulnerability
**Vulnerability:** While `electricFence` middleware scanned nested object values recursively, it completely omitted scanning the keys of JSON payloads, leaving a bypass vector where malicious ReDoS payloads in object keys could evade inspection.
**Learning:** Attackers can inject payloads not just in request values but also in request keys when Express or middleware processes user inputs dynamically or recursively.
**Prevention:** Always scan object keys in addition to values when traversing user-supplied JSON or request data structures.

## 2026-07-27 - Unbounded Memory Growth in Rate Limiters
**Vulnerability:** Simple in-memory rate limiters track requests per client IP in a Map but do not clean up expired entries, leading to unbounded memory growth and memory-exhaustion DoS over time.
**Learning:** Tracking request counts without pruning creates a memory leak when encountering diverse IP addresses (e.g. distributed botnets or standard internet traffic).
**Prevention:** Implement a sliding window reset or periodic pruning (e.g. once Map size exceeds a limit) to discard expired client IP entries securely.

## 2026-08-30 - Unbounded IP Quarantine and Accidental Global DoS in Security Middleware
**Vulnerability:** The IP-based quarantine list (`quarantinedIPs` Set) was unbounded, allowing attackers to cause a memory-exhaustion Denial of Service (DoS) by sending suspicious payloads from many unique IP addresses. Additionally, falsy IP addresses (e.g., `undefined` or `'unknown'`) could be quarantined, which accidentally locked out all legitimate clients with unresolved IPs.
**Learning:** Security state (like IP blocks) must never have unbounded memory footprints. Furthermore, fallback identifiers like `undefined` or `'unknown'` must be excluded from blocklists to prevent a single malicious or malformed request from denying access to everyone sharing that fallback.
**Prevention:** Enforce a strict maximum capacity (e.g., 1000 entries) on the quarantine Set with a FIFO eviction strategy, and explicitly validate that IP addresses are known and resolved before checking or quarantining them.
