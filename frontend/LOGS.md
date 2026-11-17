# Public release log

## 2026-11-17 — Initial public source snapshot

Prepared a standalone copy of the committed frontend at 7597101. Removed private session tracking, editor integrations, design reference archives, and internal planning files from this public copy. Runtime source and tests are preserved. Validation results are recorded in the root PUBLICATION.md. Original working directory and history are unchanged.

Validation: API build and 96 tests passed. Frontend production/SSR builds retain recorded static-route/prerender failures. Whitespace-only cleanup in seo.service.ts, reset-password.scss and variables.scss. Final directory secret scan passed.

Publication license: MIT authorized by the copyright holder on 2026-11-17; added root LICENSE and updated package/lockfile metadata in the separate copy.
