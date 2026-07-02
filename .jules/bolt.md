## 2025-05-14 - CI Pipeline Bottlenecks
**Learning:** In projects designed to compare CI performance, the overhead of dependency installation (cold starts) is often the dominant factor in pipeline duration. Missing caching for `node_modules` or using inefficient package managers (e.g., `npm` instead of `yarn` when a `yarn.lock` is present) significantly inflates build times.
**Action:** Always check for existing lockfiles (`yarn.lock`, `pnpm-lock.yaml`) and ensure CI configurations use the appropriate package manager and enable dependency caching (e.g., `actions/setup-node`'s `cache` option).
