# Bolt's Performance Journal

## 2025-05-14 - Sequential Asynchronous File I/O
**Learning:** Simply making file I/O asynchronous in Node.js can lead to race conditions and data corruption if multiple writes to the same file are triggered concurrently. This is especially critical for data persistence.
**Action:** Implement a write queue to ensure that asynchronous writes are performed sequentially. This maintains the non-blocking benefits of async I/O while guaranteeing data integrity.
## 2025-05-14 - CI Pipeline Bottlenecks
**Learning:** In projects designed to compare CI performance, the overhead of dependency installation (cold starts) is often the dominant factor in pipeline duration. Missing caching for `node_modules` or using inefficient package managers (e.g., `npm` instead of `yarn` when a `yarn.lock` is present) significantly inflates build times.
**Action:** Always check for existing lockfiles (`yarn.lock`, `pnpm-lock.yaml`) and ensure CI configurations use the appropriate package manager and enable dependency caching (e.g., `actions/setup-node`'s `cache` option).
