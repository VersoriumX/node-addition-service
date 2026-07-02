# Bolt's Performance Journal

## 2025-05-14 - Sequential Asynchronous File I/O
**Learning:** Simply making file I/O asynchronous in Node.js can lead to race conditions and data corruption if multiple writes to the same file are triggered concurrently. This is especially critical for data persistence.
**Action:** Implement a write queue to ensure that asynchronous writes are performed sequentially. This maintains the non-blocking benefits of async I/O while guaranteeing data integrity.
