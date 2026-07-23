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

## 2025-07-17 - Asymmetric Cryptographic DoS via Decryption Payloads
**Vulnerability:** Asymmetric decryption (RSA) is computationally expensive, and lack of input length validation allowed arbitrary-length payloads to be submitted, posing a high risk of CPU exhaustion and Denial of Service (DoS).
**Learning:** Even though encryption endpoints restrict plaintext input, decryption endpoints must also enforce strict length constraints because ciphertexts have predictable maximum lengths based on key size (e.g., 500 characters for a 2048-bit RSA key).
**Prevention:** Implement input length validation at both the routing layer and internal service layers before invoking asymmetric cryptographic functions.
