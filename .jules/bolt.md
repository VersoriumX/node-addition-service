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
## 2026-07-05 - Request Coalescing to prevent Thundering Herd
**Learning:** Concurrent requests for the same uncached resource can lead to redundant network calls or expensive operations, a phenomenon known as the "Thundering Herd" problem.
**Action:** Implement request coalescing by storing in-flight promises in a Map. Subsequent concurrent requests for the same resource should await the existing promise instead of initiating a new one. Ensure promises are removed from the Map once they settle to prevent memory leaks.

## 2024-05-22 - Pre-calculated ETag Caching
**Learning:** Even with pre-serialized JSON, Express (and underlying engines) will still perform a cryptographic hash of the response body to generate an ETag on every request. This is O(n) relative to body size. Pre-calculating the ETag whenever the data changes and serving it directly avoids this overhead.
**Action:** Store a pre-calculated ETag (e.g., MD5 hash) alongside cached data. In the route handler, manually check the 'If-None-Match' header against this cached ETag and return a 304 Not Modified response early to bypass serialization and data transfer. Ensure the 304 response still includes the ETag header for RFC 7232 compliance.

## 2025-05-14 - Middleware Performance and Allocation Reduction
**Learning:** Middleware functions that run on every request (like security filters) can become major bottlenecks if they perform unnecessary allocations (e.g., `Object.values()`) or redeclare helper functions. In Node.js, manual `for...in` loops and hoisting helpers outside the request handler significantly reduce GC pressure and execution time.
**Action:** Always hoist helper functions outside of Express middleware. Use manual loops instead of higher-order array methods if the object being iterated is large or if the middleware is on a hot path.

## 2024-05-23 - Combined JSON and ETag Caching for External APIs
**Learning:** For external API proxies that serve relatively static data (like price feeds), pre-serializing the JSON and pre-calculating the ETag at the moment of cache update allows for O(1) response generation. This bypasses Express's default behavior of re-serializing and re-hashing the entire response body on every request.
**Action:** In proxy services, store 'json' and 'etag' strings in the cache object and serve them directly with 'res.send()', while manually checking 'If-None-Match' to return 304 early.

## 2026-07-07 - Lazy Key Generation in RSA Cryptographic Services
**Learning:** Generating large cryptographic keys (such as a 2048-bit RSA key using `node-rsa`) synchronously during module import blocks the event loop and significantly delays startup. Deferring key instantiation to the first actual cryptographic call reduces module load time from ~100ms to < 15ms.
**Action:** Always lazy-initialize heavy cryptographic key objects or instances when they are not strictly required immediately at boot time.
