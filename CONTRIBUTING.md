# Contributing to n8n-manager-mcp

Thank you for your interest in contributing to **n8n-manager-mcp**! This repository is maintained under strict open-source governance, security SLAs, and local-first runtime invariants.

Please read these guidelines thoroughly before opening issues or submitting pull requests.

---

## English

### 1. Architectural & Governance Invariants

All contributions must strictly respect and uphold our 10 core governance and runtime invariants:

| Invariant ID | Name / Mandate | Technical Enforcement Requirement |
| :--- | :--- | :--- |
| `INV-LOCAL-01` | **100% Local-First & Zero-Egress** | MCP Stdio transport over JSON-RPC 2.0; bound strictly to `127.0.0.1` by default; zero telemetry, analytics, or external pings. |
| `INV-READ-02` | **Monotonic Read-Only Mode** | `N8N_MANAGER_READ_ONLY=1` process ceiling; write/mutation tools must be strictly blocked and return deterministic errors. |
| `INV-BACK-03` | **Automated Pre-Mutation Backups** | JSON snapshot engine in `src/safety.ts` captures full workflow state under `~/.n8n-manager-mcp/backups/` before any update/delete/activate actions. |
| `INV-AUDIT-04` | **Local Forensic Audit Trail** | Structured append-only JSON logging under `~/.n8n-manager-mcp/audit.log` records timestamp, server URL, workflow ID, tool, and outcome. |
| `INV-SRV-05` | **Multi-Server & Credential Isolation** | Isolated server configurations in `~/.n8n-manager-mcp/servers.json`; whitespace-stripped API keys; safe default server selection semantics. |
| `INV-TRAV-06` | **Input Validation & Path Traversal Guard** | Zod numeric bounds (1..1000 for pagination, 0..1000 for connections); path sanitization prevents directory escapes and symlink bypasses. |
| `INV-PRIV-07` | **Non-Elevation & User-Space Security** | Executes exclusively as unprivileged user (`RunAsInvoker`); zero administrative elevation or root permissions requested. |
| `INV-SEAM-08` | **Opt-In Decision History Seam** | Optional adapter to `n8n-workflow-manager` via `N8N_MCP_MANAGER_URL`; explicit fail-fast without silent fallback to n8n directly. |
| `INV-NODE-09` | **Offline Node Catalog & Introspection** | Bundled static node catalog in `src/nodes.ts` provides complete schema introspection for AI agents without API network roundtrips. |
| `INV-SLA-10` | **Multi-Node CI & 48h / 30d Security SLA** | GitHub Actions matrix on Node.js 20 and 22 with concurrency cancellation; committed 48h initial response, 5-day triage, and 30-day remediation SLA. |

### 2. Development Workflow (Plan D)

- **Canonical Repository:** Development takes place exclusively in canonical git clones (`C:\_Local_DEV\repos\n8n-manager-mcp` or your local clone) against `origin/main`.
- **Version-Freeze Policy:** Version tags follow policy `T-20260920-167562623`. Do not increment version numbers in PRs; releases are coordinated centrally.
- **Node.js Environment:** Requires Node.js `>=20.0.0` and npm.
  ```bash
  npm ci
  npm run build
  npm test
  npm run smoke
  ```
- **Type Safety & Linting:** TypeScript strict mode is enabled. All code must compile cleanly via `tsc` without errors.

### 3. Pull Request Guidelines

1. **Focused Scope:** One feature, bug fix, or documentation enhancement per pull request.
2. **Contract & Unit Tests:** Add or update test coverage in `test/` for any behavioral changes. All existing and new tests must pass (`npm test`).
3. **Smoke Verification:** Verify MCP tool registration and introspection via `npm run smoke`.
4. **Documentation Parity:** If user-facing behavior or tools change, update `README.md`, `README_de.md`, and `llms.txt`.
5. **License & Attribution:** All contributions are licensed under the [MIT License](LICENSE) with attribution documented in [NOTICE](NOTICE).

### 4. Security & Incident Reporting

For security disclosures, please refer to our [Security Policy](SECURITY.md). Do not file public issues for vulnerabilities. Email:
- Primary: `security@ellmos.ai`
- Umbrella: `security@open-bricks.org`
- Maintainer: `support@lukasgeiger.com`

---

## Deutsch

### 1. Architektur- und Governance-Invarianten

Alle Beiträge müssen unsere 10 verbindlichen Sicherheits- und Laufzeitinvarianten einhalten:

| Invarianten-ID | Name / Schutzbereich | Technische Implementierungsanforderung |
| :--- | :--- | :--- |
| `INV-LOCAL-01` | **100% Local-First & Zero-Egress** | MCP Stdio-Transport über JSON-RPC 2.0; standardmäßig an `127.0.0.1` gebunden; null Telemetrie, Analyse-Pings oder externe Tracker. |
| `INV-READ-02` | **Monotoner Read-Only-Schutz** | `N8N_MANAGER_READ_ONLY=1` als Prozess-Obergrenze; schreibende/mutierende Werkzeuge werden strikt unterbunden. |
| `INV-BACK-03` | **Automatisierte Pre-Mutation-Snapshots** | JSON-Snapshot-Engine in `src/safety.ts` sichert vollständigen Workflow-Zustand unter `~/.n8n-manager-mcp/backups/` vor Änderungen. |
| `INV-AUDIT-04` | **Forensischer Lokaler Audit-Trail** | Strukturiertes Append-Only JSON-Protokoll unter `~/.n8n-manager-mcp/audit.log` mit Zeitstempel, Server-URL, Workflow-ID und Status. |
| `INV-SRV-05` | **Multi-Server & Credential-Isolation** | Isolierte Server-Konfiguration in `~/.n8n-manager-mcp/servers.json`; bereinigte API-Keys; sichere Standard-Server-Semantik. |
| `INV-TRAV-06` | **Eingabevalidierung & Pfad-Traversierungsschutz** | Zod-Zahlenbereichsgrenzen (1..1000 Paginierung, 0..1000 Verbindungen); Pfadbereinigung verhindert Verzeichnis-Ausbrüche. |
| `INV-PRIV-07` | **Rechte-Nicht-Eskalation & User-Space** | Ausführung ausschließlich im unprivilegierten Standard-Benutzerkontext (`RunAsInvoker`); keine Administrator-/Root-Rechte nötig. |
| `INV-SEAM-08` | **Opt-In Decision History Nahtstelle** | Optionaler Adapter zu `n8n-workflow-manager` via `N8N_MCP_MANAGER_URL`; expliziter Schnellfehler ohne unbemerkten Fallback. |
| `INV-NODE-09` | **Offline Node-Katalog & Introspektion** | Gebündelter statischer Node-Katalog in `src/nodes.ts` liefert Schemainformationen für KI-Agenten ohne Netzwerk-Roundtrips. |
| `INV-SLA-10` | **Multi-Node CI & 48h / 30d Sicherheits-SLA** | GitHub Actions Matrix für Node.js 20 und 22 mit Concurrency-Abbruch; verbindliche 48h Reaktions-, 5-Tage-Triage- und 30-Tage-Fix-SLA. |

### 2. Entwicklungsworkflow (Plan D)

- **Kanonisches Repository:** Entwicklung erfolgt ausschließlich im lokalen Git-Klon (`C:\_Local_DEV\repos\n8n-manager-mcp`) und GitHub `origin/main`.
- **Versions-Freeze Richtlinie:** Versionsstände unterliegen der Richtlinie `T-20260920-167562623`. Bitte keine Versionsnummern eigenmächtig erhöhen; Änderungen unter `[Unreleased]` im `CHANGELOG.md` führen.
- **Node.js Umgebung:** Erfordert Node.js `>=20.0.0` und npm.
  ```bash
  npm ci
  npm run build
  npm test
  npm run smoke
  ```
- **Typsicherheit & Build:** Strenger TypeScript-Modus aktiv. Der Build via `npm run build` muss ohne Fehler kompilieren.

### 3. Pull-Request Richtlinien

1. **Fokussierter Umfang:** Ein Thema, Bugfix oder Feature pro Pull Request.
2. **Vertragstests & Regression:** Neue oder modifizierte Funktionen durch Unit- und Vertragstests in `test/` absichern (`npm test`).
3. **Smoke-Prüfung:** Werkzeug-Registrierung und Schema-Funktion via `npm run smoke` verifizieren.
4. **Dokumentations-Parität:** Bei Schnittstellenänderungen `README.md`, `README_de.md` und `llms.txt` synchron halten.
5. **Lizenz & Urheberschaft:** Alle Beiträge werden unter der [MIT-Lizenz](LICENSE) bereitgestellt; Urheberrecht gem. [NOTICE](NOTICE).

### 4. Sicherheit & Meldewege

Sicherheitsrelevante Schwachstellen bitte vertraulich per E-Mail melden (siehe [SECURITY.md](SECURITY.md)):
- Primär: `security@ellmos.ai`
- Dachorganisation: `security@open-bricks.org`
- Betreuer: `support@lukasgeiger.com`
