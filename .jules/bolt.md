# Bolt's Performance Journal

## 2025-05-14 - Sequential Asynchronous File I/O
**Learning:** Simply making file I/O asynchronous in Node.js can lead to race conditions and data corruption if multiple writes to the same file are triggered concurrently. This is especially critical for data persistence.
**Action:** Implement a write queue to ensure that asynchronous writes are performed sequentially. This maintains the non-blocking benefits of async I/O while guaranteeing data integrity.
## 2025-05-14 - CI Pipeline Bottlenecks
**Learning:** In projects designed to compare CI performance, the overhead of dependency installation (cold starts) is often the dominant factor in pipeline duration. Missing caching for `node_modules` or using inefficient package managers (e.g., `npm` instead of `yarn` when a `yarn.lock` is present) significantly inflates build times.
**Action:** Always check for existing lockfiles (`yarn.lock`, `pnpm-lock.yaml`) and ensure CI configurations use the appropriate package manager and enable dependency caching (e.g., `actions/setup-node`'s `cache` option).

## 2025-05-14 - ReDoS in ansi-regex
**Learning:** Inefficient regular expressions in widely used utility packages like `ansi-regex` can lead to Regular Expression Denial of Service (ReDoS) vulnerabilities. These occur when a regex takes exponential time to process certain inputs, blocking the event loop.
**Action:** Regularly audit and update transitive dependencies, especially those providing regex patterns for user-controlled input. Ensure `ansi-regex` is at least `3.0.1` or `5.0.1`.

## 2025-05-14 - Active Defense Against ReDoS
**Learning:** While patching vulnerable libraries is essential, implementing an active defense layer (middleware) can provide immediate protection and visibility into attack attempts. Quarantining IPs that send suspicious payloads (e.g., extremely long strings that could trigger even a "fixed" regex if it's still computationally expensive) prevents repeated attempts.
**Action:** Use defensive middleware to inspect request parameters and implement an IP-based blocklist for high-risk activity.

## 2025-05-14 - External API Caching & Frontend Search Optimization
**Learning:** High-frequency external API calls can lead to rate-limiting and performance degradation. Similarly, fetching large datasets on every frontend interaction (like keystrokes in search) creates unnecessary network overhead.
**Action:** Implement in-memory caching for external API responses with short TTLs. On the frontend, fetch and cache the initial dataset on page load to allow for near-instant search results without repetitive network requests.

## 2026-07-05 - Pre-serialized JSON Caching
**Learning:** In read-heavy APIs returning JSON arrays, `JSON.stringify()` can become a bottleneck even if the underlying data is already cached in memory. Pre-serializing the data into a JSON string and serving it directly avoids the O(n) serialization cost on every request.
**Action:** Pre-calculate and cache the JSON string representation of frequently requested datasets whenever the data changes, and serve it using `res.send()` with the appropriate content-type header.

## 2026-07-06 - Request Coalescing (Thundering Herd Defense)
**Learning:** Simple time-based caching is vulnerable to the "Thundering Herd" problem, where multiple concurrent requests for an expired or missing resource trigger redundant network calls simultaneously. This wastes bandwidth and risks rate-limiting from external APIs.
**Action:** Implement request coalescing by tracking ongoing requests in a `Map` of promises. Concurrent calls for the same resource should await the existing promise instead of initiating new ones.
