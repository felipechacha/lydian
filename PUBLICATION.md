# Publication notes

Prepared on 2026-11-17 from local committed snapshots:

- Frontend: `7597101` (practice-summary/recovery integration branch).
- Backend: `36578d0` (practice-insights/recovery branch).

The original repositories and local uncommitted changes are preserved. This publication starts a new Git history rather than exporting private commit history.

## Exclusions

Private session logs, time tracking, internal task boards, editor MCP configuration, UI reference screenshots and design ZIPs were omitted. Whitespace-only cleanup was applied in three frontend files so the initial Git diff passes whitespace checks. Runtime behavior is preserved. Runtime source, test fixtures, database migrations, lockfiles and placeholder environment configuration remain included. Source logs were replaced with a concise public-snapshot entry.

## Validation

- Gitleaks 8.30.1 directory scan of the initial snapshot: no leaks found. The executable checksum was checked against the official release checksums.
- API: build passed; 22 test suites, 96 tests passed.
- Frontend: production build compiled bundles and prerendered 16 routes, but failed because server-rendered routes conflict with static output mode. The existing SSR profile also failed during prerendering of pages that request the API. These are recorded limitations of the source snapshot; runtime source was not modified to hide them.
- Browser QA, live Supabase migrations, SMTP, deployment and real user flows were not run for this source publication.

A secret-pattern scan cannot guarantee that every confidential item has been identified. No live credentials or original environment files are intentionally included.

## Licensing and program applications

The copyright holder authorized publication under the MIT License on 2026-11-17. Package metadata and the root LICENSE reflect that authorization. A newly public repository does not establish adoption, download volume, external contribution history or ecosystem importance. Any benefit application must describe those metrics accurately and note that the public release is new.
