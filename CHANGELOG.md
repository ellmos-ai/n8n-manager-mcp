# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Replace Spanish, Simplified Chinese, Japanese, and Russian i18n fallbacks with real n8n Manager translations.
- Add direct i18n tests for supported language order, language switching, non-English strings, and placeholder interpolation.
- Add GitHub Actions test workflow for Node.js 20, 22, and 24 with build, Vitest, and npm package checks.

### Changed
- Include `server.json` in npm package metadata and add npm homepage/bug-report links.
- Update GitHub community workflows to current `actions/stale` and `actions/first-interaction` versions.
- Clarify Glama and official MCP Registry namespace status in README and `llms.txt`.
- Align liability text with the actual MIT license.

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
