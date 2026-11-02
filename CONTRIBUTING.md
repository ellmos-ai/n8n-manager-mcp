# Contributing to n8n-manager-mcp

Thank you for your interest in contributing to **n8n-manager-mcp**! This document describes the project workflow and current implementation areas. Security response and remediation commitments are published in `SECURITY.md`.

Please read these guidelines thoroughly before opening issues or submitting pull requests.

---

## English

### 1. Implementation Areas & Policy

The reference IDs below group current source behavior and published policy for contributor orientation. They are not guarantees that behavior is enforced outside the described scope. Update relevant docs and tests when implementation changes.

| Reference | Implemented behavior | Scope and policy |
| :--- | :--- | :--- |
| `INV-LOCAL-01` | The MCP server communicates with its client over stdio and opens no MCP listening port. | Requests go to configured n8n endpoints, optionally to the configured manager, and an update check may run on interactive TTY startup. This is not zero-egress. |
| `INV-READ-02` | Persisted read-only mode blocks workflow mutation tools; `N8N_MANAGER_READ_ONLY=1` is an environment ceiling the tool cannot disable. | Configuration is loaded before the mutation check. A blocked attempt may append a local audit entry, so this is not filesystem read-only mode. |
| `INV-BACK-03` | With `backup_before_mutations` enabled (default: true), workflow JSON snapshots are attempted before update, delete, activate/deactivate, and overwrite-restore operations. | Create/import are not pre-backed up. If an enabled snapshot fetch or save fails, the subsequent n8n mutation request is not sent. Backups are local plaintext. |
| `INV-AUDIT-04` | `audit_log` is configurable and enabled by default; supported operation outcomes and blocked mutation attempts are appended to a local JSON log. | The log is not tamper-proof. Append errors propagate and can occur after an upstream mutation has succeeded. |
| `INV-SRV-05` | Multiple server profiles are stored locally in `~/.n8n-manager-mcp/servers.json`; default-server selection is defined by the tool behavior. | API keys are plaintext. New config files request POSIX mode `0600`; Windows access follows directory ACLs. |
| `INV-TRAV-06` | Input schemas validate numeric ranges (1..1000 for list limits and 0..1000 for connection indices). Backup path segments are sanitized and checked against the configured root in relevant operations. | Real-path and symlink checks are scoped to backup, listing, and restore file handling; they do not establish general immunity to traversal, prototype pollution, or malformed-payload failures. |
| `INV-PRIV-07` | The server does not request privilege elevation. | The Node.js process inherits its launcher's privileges; no privilege-dropping mechanism or `RunAsInvoker` enforcement is implemented. |
| `INV-SEAM-08` | Optional `n8n_manager_history` uses `N8N_MCP_MANAGER_URL` and does not fall back to querying n8n when the manager is unreachable. | When configured, it sends a request to the manager endpoint. |
| `INV-NODE-09` | `n8n_describe_nodes` returns offline descriptions of common node types. | It does not provide complete node schemas or required properties. |
| `INV-SLA-10` | GitHub Actions runs build, test, smoke, and package checks on Ubuntu with Node.js 20 and 22. `SECURITY.md` publishes response, triage, and remediation commitments. | CI does not establish cross-platform stability. The policy sets a 48-hour initial response, triage within 5 business days, and remediation within 30 calendar days after confirmation of a reported vulnerability; these are policy commitments, not a report of observed performance. |

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
4. **Documentation Parity:** If user-facing behavior or tools change, update `README.md`, `README_de.md`, `README_es.md`, and `llms.txt`.
5. **License & Attribution:** All contributions are licensed under the [MIT License](LICENSE) with attribution documented in [NOTICE](NOTICE).

### 4. Security & Incident Reporting

For security disclosures, please refer to our [Security Policy](SECURITY.md). Do not file public issues for vulnerabilities. Email:
- Primary: `security@ellmos.ai`
- Umbrella: `security@open-bricks.org`
- Maintainer: `support@lukasgeiger.com`

---

## Deutsch

### 1. Implementierungsbereiche und Richtlinie

Die folgenden Referenz-IDs ordnen aktuelles Quellverhalten und veröffentlichte Richtlinien ein. Sie sind keine Garantien über den beschriebenen Umfang hinaus. Bei Änderungen am Verhalten müssen die betroffenen Dokumente und Tests mitaktualisiert werden.

| Referenz | Implementiertes Verhalten | Umfang und Richtlinie |
| :--- | :--- | :--- |
| `INV-LOCAL-01` | Der MCP-Server kommuniziert über stdio mit seinem Client und öffnet keinen MCP-Listener. | Anfragen gehen an konfigurierte n8n-Endpunkte, optional an den konfigurierten Manager; beim Start in einem interaktiven TTY kann ein Update-Check laufen. Das bedeutet nicht „Zero-Egress“. |
| `INV-READ-02` | Der gespeicherte Read-Only-Modus blockiert Workflow-Mutationswerkzeuge; `N8N_MANAGER_READ_ONLY=1` ist eine Umgebungsobergrenze, die das Werkzeug nicht deaktivieren kann. | Die Konfiguration wird vor der Mutationsprüfung geladen. Ein blockierter Versuch kann einen lokalen Audit-Eintrag anhängen; das ist kein Dateisystem-Read-Only-Modus. |
| `INV-BACK-03` | Bei aktiviertem `backup_before_mutations` (Standard: true) werden vor Update, Löschen, Aktivieren/Deaktivieren und überschreibendem Restore JSON-Snapshots versucht. | Erstellen und Import werden nicht vorher gesichert. Scheitert Abruf oder Speicherung eines aktivierten Snapshots, wird die folgende n8n-Mutationsanfrage nicht gesendet. Backups liegen lokal im Klartext. |
| `INV-AUDIT-04` | `audit_log` ist konfigurierbar und standardmäßig aktiviert; unterstützte Operationsergebnisse und blockierte Mutationsversuche werden an ein lokales JSON-Log angehängt. | Das Log ist nicht manipulationssicher. Append-Fehler werden weitergereicht und können nach erfolgreicher Remote-Mutation auftreten. |
| `INV-SRV-05` | Mehrere Serverprofile werden lokal in `~/.n8n-manager-mcp/servers.json` gespeichert; die Standard-Serverauswahl ist durch das Werkzeugverhalten festgelegt. | API-Keys liegen im Klartext. Neue Konfigurationsdateien fordern POSIX-Modus `0600` an; unter Windows gelten Verzeichnis-ACLs. |
| `INV-TRAV-06` | Eingabeschemas validieren Zahlenbereiche (1..1000 für Listenlimits, 0..1000 für Verbindungsindizes). Backup-Pfadsegmente werden bereinigt und bei den betreffenden Dateioperationen gegen den konfigurierten Root geprüft. | Realpath- und Symlink-Prüfungen sind auf Backup-, Listen- und Restore-Vorgänge begrenzt; sie belegen keine allgemeine Immunität gegen Traversal, Prototype-Pollution oder fehlerhafte Payloads. |
| `INV-PRIV-07` | Der Server fordert keine Rechteerhöhung an. | Der Node.js-Prozess erbt die Rechte des startenden Prozesses; ein Rechteabbau oder eine `RunAsInvoker`-Erzwingung ist nicht implementiert. |
| `INV-SEAM-08` | `n8n_manager_history` verwendet optional `N8N_MCP_MANAGER_URL` und fragt bei Nichterreichbarkeit des Managers nicht direkt n8n ab. | Bei Einrichtung wird eine Anfrage an den Manager-Endpunkt gesendet. |
| `INV-NODE-09` | `n8n_describe_nodes` liefert Offline-Beschreibungen gängiger Node-Typen. | Vollständige Node-Schemas oder Pflichtparameter werden nicht bereitgestellt. |
| `INV-SLA-10` | GitHub Actions führt Build-, Test-, Smoke- und Paketprüfungen auf Ubuntu mit Node.js 20 und 22 aus. `SECURITY.md` veröffentlicht Reaktions-, Triage- und Behebungszusagen. | Die CI belegt keine plattformübergreifende Stabilität. Die Richtlinie setzt eine erste Reaktion binnen 48 Stunden, Triage binnen 5 Werktagen und Behebung binnen 30 Kalendertagen nach Bestätigung einer gemeldeten Schwachstelle fest; dies sind Richtlinienzusagen, keine Messwerte zur tatsächlichen Leistung. |

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
4. **Dokumentations-Parität:** Bei Änderungen an Nutzerverhalten oder Werkzeugen `README.md`, `README_de.md`, `README_es.md`, `README_ja.md`, `README_ru.md`, `README_fr.md` und `llms.txt` aktualisieren.
5. **Lizenz & Urheberschaft:** Alle Beiträge werden unter der [MIT-Lizenz](LICENSE) bereitgestellt; Urheberrecht gem. [NOTICE](NOTICE).

### 4. Sicherheit & Meldewege

Sicherheitsrelevante Schwachstellen bitte vertraulich per E-Mail melden (siehe [SECURITY.md](SECURITY.md)):
- Primär: `security@ellmos.ai`
- Dachorganisation: `security@open-bricks.org`
- Betreuer: `support@lukasgeiger.com`
