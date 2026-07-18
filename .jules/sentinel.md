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

## 2026-07-18 - Express 5.x Runtime Crash with path-to-regexp Resolution
**Vulnerability:** Forcing legacy versions of `path-to-regexp` (< 8.0.0) via package resolutions to resolve ReDoS issues in older versions introduced a severe runtime crash (`TypeError: pathRegexp.match is not a function`) when upgraded to Express 5.x.
**Learning:** Express 5.x has major breaking changes and relies on modern `path-to-regexp` APIs (version 8+). Enforcing outdated dependencies globally across package managers can cause critical service outages.
**Prevention:** Always verify runtime capability and test package startup after altering resolutions, and match dependency resolution overrides with the major version requirements of active frameworks.

## 2026-07-18 - Unbounded User Input and Non-String Payload Crashes
**Vulnerability:** Endpoint `/api/fuzz` was susceptible to crashes (`TypeError: toUpperCase is not a function`) and resource-exhaustion Denial of Service (DoS) when passed non-string payloads or extremely large inputs. `/api/encrypt` crashed on strings exceeding Node-RSA 2048-bit PKCS#1 padding limits (> 245 characters).
**Learning:** Relying on standard route input parsers without explicit type and size validation can result in unexpected library/runtime errors and application crashes under abnormal workloads.
**Prevention:** Strictly validate input types (e.g. check `typeof input === 'string'`) and enforce conservative maximum length bounds (e.g., 250 for fuzzer, 245 for RSA encryption) at both the API routing layer and utility service layer.
