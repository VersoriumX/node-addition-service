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
