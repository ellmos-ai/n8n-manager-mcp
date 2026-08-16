# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-08-04

### Added (2026-08-13)
- First step of the planned conversion from a standalone tool server towards an
  adapter over the `n8n-workflow-manager` module: a new read-only tool
  `n8n_manager_history` surfaces that module's version history, recorded
  decisions, sync history, and remote bindings to any MCP client.
- New module `src/manager-client.ts` holds the seam (URL resolution, probing,
  reads, formatting) with an injectable `fetch`, so the shipped code is the code
  under test rather than a copy of its logic.
- `n8n_safety_status` now reports the *measured* seam state -- configured,
  reachable, manager version -- instead of only echoing the environment, and
  warns when the manager URL is not loopback (its API is unauthenticated).
- Packaging: include `glama.json`, `smithery.yaml`, and `llms.txt` in npm package files.

### Fixed (2026-08-13)
- Validate workflow, execution, and backup list limits as finite positive
  integers in the documented range 1..1000, and validate workflow connection
  output/input indices in the range 0..1000 before API, filesystem, or array
  access. The existing defaults remain unchanged.

### Documentation (2026-08-13)
- Correct the EN/DE platform-verification statement: the current workflow runs
  on Ubuntu Linux with Node.js 20, 22, and 24; macOS is not claimed without a
  macOS runner.

### Documentation (2026-08-10)
- Replace static README test-count badges and prose with stable suite wording,
  so routine coverage growth cannot leave public documentation stale.
- Refresh `llms.txt` with the current local verification result.

### Security (2026-08-10)
- Make `N8N_MANAGER_READ_ONLY=1` a monotonic enforcement control so persisted
  safety settings cannot re-enable workflow mutations.

### Fixed (2026-08-08)
- Constrain generated backup directories and files to the configured backup
  root, including reserved-name mapping, regular-JSON listing, and
  symlink/reparse-aware restore checks.
- Preserve an existing server's default flag when `n8n_add_server` updates it
  without `is_default`; explicit `true` promotes and explicit `false` removes
  the flag, with deterministic first-server fallback when none remains.
- Raise the transitive `nanoid` override to `^3.3.17`; the refreshed lockfile
  resolves `3.3.18` and `npm audit` reports zero vulnerabilities.

### Verification (2026-08-08)
- Fresh `npm ci`, `npm run build`, and `npm test` pass with 109/109 tests;
  `npm pack --dry-run --json` contains the built server and backup-path module,
  and `npm run smoke` discovers all 18 tools.
- The latest landed `main` CI run (commit `21e268b`) is green on Node.js 20,
  22, and 24; this local change remains unpushed pending normal review.
### Security (2026-08-11)
- Close the remaining open Dependabot advisories in the lockfile: add the
  `express-rate-limit` override (`^8.6.2`) and raise `hono` to `^4.13.0`.
  The `nanoid` and `fast-uri` overrides had already landed on 2026-08-08.
  `npm audit` reports 0 vulnerabilities.

### Changed (2026-08-07)
- Reconcile the diverged `main` and `master` branches (open since 0.1.14) back
  into a single line of development, section by section rather than by taking
  either side wholesale.
- Adopt the dependency `overrides` from `master` (`@hono/node-server`,
  `postcss`) and raise `vitest` from `^3.0.8` to the current line in both
  `devDependencies` and `overrides`.
- Raise the declared Node.js floor from 18 to 20 in `package.json` (`engines`),
  both READMEs and `llms.txt`. The `@hono/node-server` 2.x override requires
  Node 20 and the CI matrix has only ever tested 20/22/24, so the advertised
  `>=18` was wrong.

### Removed (2026-08-07)
- Drop `smithery.yaml`, its `package.json` `files` entry and its assertion in
  the repository-hygiene test. The listing it advertised does not exist:
  `smithery.ai/server/@ellmos-ai/n8n-manager-mcp` returns HTTP 404. Same
  finding and same removal as in `ellmos-clatcher-mcp` and
  `ellmos-codecommander-mcp`.

### Maintenance
- Technical hygiene & maintenance check [G 2026-07-29]: 103/103 tests verified.
  The `llms.txt` timestamp from that run has since been superseded by the
  2026-08-04 audit below.

### Security (2026-08-05)
- Close both open Dependabot advisories via lockfile update: `fast-uri`
  (high, GHSA-7p8r-x3mc-p8w7) and `hono` (moderate, GHSA-8j4g-w8fx-2239).
  `npm audit` reports 0 vulnerabilities; build and 103/103 Vitest tests
  stay green.

### Changed
- Enhanced Discoverability, README design, SEO & LLM Indexing (Pfad B Audit).
- Added interactive Mermaid architecture diagram visualizing MCP Stdio integration, safety layer, and multi-server n8n REST API orchestration.
- Added Node.js, Vitest (103 passed), Ecosystem (`ellmos-ai`), and Umbrella (`open-bricks`) Shields.io status badges.
- Added GFM `llms.txt` Callout note in both English (`README.md`) and German (`README_de.md`) documentation.
- Updated `llms.txt` verification timestamp to 2026-08-04.

## [0.1.14] - 2026-07-25

### Security & Maintenance
- Remediate `postcss <=8.5.17` high-severity vulnerability (`GHSA-r28c-9q8g-f849`), `fast-uri`, `body-parser`, and `hono` security findings via dependency updates.
- Synchronize version string 0.1.14 across `package.json`, `package-lock.json`, `server.json`, `glama.json`, and `src/index.ts`.
- Verify full test suite (70 tests passing).

## [0.1.13] - 2026-07-24

### Fixed
- Correct FileCommander (46) and CodeCommander (22) tool counts in the ecosystem family table; counts now verified against the live MCP `tools/list` surface.
- Align the McpServer runtime version in `src/index.ts` with package.json.

## [0.1.12] - 2026-07-24

### Changed
- Unified the ellmos-ai ecosystem section in README.md and README_de.md: full 9-server MCP family table with refreshed tool counts, AI infrastructure, and desktop software links.
- Refreshed `glama.json` for the Glama MCP directory listing.
- Synced `server.json` version metadata.

## [0.1.12] - 2026-07-21

### Security
- Refresh the `hono` override to `^4.12.31`, resolving the current Hono advisory while retaining the latest compatible MCP SDK line and the package's Node.js 18 support.
- Record that the current MCP SDK release still carries an advisory through its optional HTTP transport dependency; its only published remediation requires either a vulnerable older SDK or a Node.js 20-only incompatible transitive override. This stdio-only server does not invoke that transport.

## [0.1.11] - 2026-07-03

### Security
- Harden repository hygiene for local n8n server configs, tokens, recovery codes, private keys, local backups, audit logs, and SQLite files.
- Validate `n8n_add_server` input before saving local server configuration: reject malformed URLs, non-HTTP schemes, embedded credentials, query strings, fragments, empty names, and whitespace-bearing API keys.
- URL-encode `workflow_id`/`target_workflow_id`/`status` before embedding them in n8n REST API request paths and query strings (`n8n_get_workflow`, `n8n_update_workflow`, `n8n_delete_workflow`, `n8n_activate_workflow`, `n8n_export_workflow`, `n8n_restore_workflow`, `n8n_list_executions`). These are free-form strings from the MCP caller; unescaped, characters like `&`, `?`, or `/` could inject extra query parameters or alter the request path against the configured n8n server.

### Added
- Regression tests covering the new URL-encoding behavior for workflow IDs and execution filters.

## [0.1.10] - 2026-06-17

### Added
- Replace Spanish, Simplified Chinese, Japanese, and Russian i18n fallbacks with real n8n Manager translations.
- Add direct i18n tests for supported language order, language switching, non-English strings, and placeholder interpolation.
- Add GitHub Actions test workflow for Node.js 20, 22, and 24 with build, Vitest, and npm package checks.
- Add a manual stdio MCP smoke runner that verifies all 18 registered tools and a safe `n8n_describe_nodes` call against the built server.
- Add a TTY-guarded `update-notifier` check for interactive CLI starts while keeping MCP stdio output unchanged.

### Changed
- Include `server.json` in npm package metadata and add npm homepage/bug-report links.
- Include `CHANGELOG.md` in the npm package file list.
- Normalize `package.json` repository metadata to npm's `git+https` form.
- Update GitHub community workflows to current `actions/stale` and `actions/first-interaction` versions.
- Clarify Glama and official MCP Registry namespace status in README and `llms.txt`.
- Align liability text with the actual MIT license.
- Clarify MCP directory namespace status and add the public Enterprise DNA directory entry.
- Refresh discovery metadata with the PulseMCP listing, broader n8n workflow MCP search phrases, current ellmos MCP family entries, and npm keywords.

### Fixed
- Align `package.json`, lockfile, MCP runtime version, source header, generated dist bundle, and `server.json` metadata after the update-notifier release.
- Refresh npm dependency locks so the production audit finding for `hono` is resolved.

## [0.1.8] - 2026-05-23

### Added
- Safety controls for n8n mutations: read-only mode, backup-before-update/delete/activate, local backup listing, restore from backup, and JSONL audit logging.
- `n8n_safety_status`, `n8n_set_safety_mode`, `n8n_list_backups`, and `n8n_restore_workflow`.

### Fixed
- Refresh npm lockfile and overrides to resolve Dependabot alerts for `hono`, `fast-uri`, `ip-address`, `vite`, `esbuild`, and `qs`.
- Update stale security reporting links to the `ellmos-ai` repository.

## [0.1.7] - 2026-05-17

### Added
- Comprehensive test suite with 75 tests covering all 13 tools (vitest)
- Cross-platform compatibility verified on Windows, macOS, and Linux
- Development/Testing section in README.md and README_de.md

## [0.1.6] - 2026-02-20

### Fixed
- Initial public release on npm
