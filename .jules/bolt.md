## 2025-05-14 - CI Pipeline Bottlenecks
**Learning:** In projects designed to compare CI performance, the overhead of dependency installation (cold starts) is often the dominant factor in pipeline duration. Missing caching for `node_modules` or using inefficient package managers (e.g., `npm` instead of `yarn` when a `yarn.lock` is present) significantly inflates build times.
**Action:** Always check for existing lockfiles (`yarn.lock`, `pnpm-lock.yaml`) and ensure CI configurations use the appropriate package manager and enable dependency caching (e.g., `actions/setup-node`'s `cache` option).

## 2025-05-14 - ReDoS in ansi-regex
**Learning:** Inefficient regular expressions in widely used utility packages like `ansi-regex` can lead to Regular Expression Denial of Service (ReDoS) vulnerabilities. These occur when a regex takes exponential time to process certain inputs, blocking the event loop.
**Action:** Regularly audit and update transitive dependencies, especially those providing regex patterns for user-controlled input. Ensure `ansi-regex` is at least `3.0.1` or `5.0.1`.

## 2025-05-14 - Active Defense Against ReDoS
**Learning:** While patching vulnerable libraries is essential, implementing an active defense layer (middleware) can provide immediate protection and visibility into attack attempts. Quarantining IPs that send suspicious payloads (e.g., extremely long strings that could trigger even a "fixed" regex if it's still computationally expensive) prevents repeated attempts.
**Action:** Use defensive middleware to inspect request parameters and implement an IP-based blocklist for high-risk activity.
