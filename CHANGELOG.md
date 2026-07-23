# Changelog

All notable changes to this project will be documented in this file.

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
