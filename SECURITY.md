# Sicherheitsrichtlinie / Security Policy

## Deutsch

### Unterstützte Versionen

Wir veröffentlichen Sicherheitspatches für die aktuelle Haupt- und Minor-Version:

| Version | Unterstützt | Anmerkungen |
| :--- | :--- | :--- |
| `0.1.x` | :white_check_mark: | Aktive Version (Latest Release) |
| `< 0.1.0` | :x: | Veraltet, bitte auf die aktuelle Version aktualisieren |

### Sicherheitslücken melden

Wenn Sie eine Sicherheitslücke in **n8n-manager-mcp** finden, melden Sie diese bitte verantwortungsvoll:

1. **Kein öffentliches Issue eröffnen**
2. **GitHub Private Vulnerability Reporting verwenden** ([Security Advisories](https://github.com/ellmos-ai/n8n-manager-mcp/security/advisories/new))
3. Beschreibung, Schritte zur Reproduktion und potenzielle Auswirkungen beifügen

### So melden Sie ein Problem

1. Öffnen Sie im Repository: `Security` → `Advisories` → `New`
2. Tragen Sie Titel, Beschreibung, Schweregrad und betroffene Versionen ein
3. Reichen Sie die Meldung privat ein

Falls Private Vulnerability Reporting im Repository noch nicht aktiv ist, kontaktieren Sie das Sicherheitsteam direkt per E-Mail unter `security@open-bricks.org`, `security@ellmos.ai`, `support@lukasgeiger.com` oder `lukas@open-bricks.org` und veröffentlichen Sie keine Details in einem öffentlichen Issue.

### Reaktionszeit & SLA

- **Erstreaktion:** Innerhalb von **48 Stunden**
- **Triage & Bestätigung:** Innerhalb von **5 Werktagen**
- **Patch-Bereitstellung:** Zeitnah nach Verifikation über GitHub Releases und npm Registry

### Integrierte Schutz- und Sicherheitsmechanismen

- **Local-First & Socket-Bindung:** Der MCP-Server läuft standardmäßig lokal über Stdio und bindet lokale Netzwerkdienste ausschließlich an `127.0.0.1`.
- **Read-Only Schutzmodus:** Der Nur-Lese-Modus blockiert Operationen zum Erstellen, Aktualisieren, Löschen, Aktivieren/Deaktivieren, Importieren und Wiederherstellen von Workflows. Über `N8N_MANAGER_READ_ONLY=1` wird dieser Modus prozessweit monoton erzwungen und kann nicht durch persistierte Einstellungen überschrieben werden.
- **Automatische Workflow-Backups:** Vor mutierenden Operationen (Update, Löschen, Aktivieren, Überschreiben) wird standardmäßig ein lokales JSON-Backup unter `~/.n8n-manager-mcp/backups/` angelegt.
- **Audit-Protokollierung:** Alle Mutationsereignisse werden standardmäßig lokal in `~/.n8n-manager-mcp/audit.log` auditiert.
- **Eingabe- und Pfadvalidierung:** Backup-Pfade und Eingabeparameter unterliegen strengen Desinfektionsregeln (Path-Traversal-Schutz, Validierung numerischer Limits auf 1..1000, Index-Grenzen 0..1000).
- **Prozessisolierung & Non-Elevation:** Der Server operiert im Benutzerkontext ohne administrative Rechte (Non-Elevation).
- **Sicherheitsstatus-Inspektion:** Über die Werkzeuge `n8n_safety_status` und `n8n_set_safety_mode` können die aktuellen Sicherheitsrichtlinien jederzeit eingesehen und angepasst werden.

---

## English

### Supported Versions

We release security patches for the active major and minor release lines:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `0.1.x` | :white_check_mark: | Active release line (Latest Release) |
| `< 0.1.0` | :x: | Deprecated, please upgrade to the latest version |

### Reporting a Vulnerability

If you discover a security vulnerability in **n8n-manager-mcp**, please report it responsibly:

1. **Do NOT open a public issue**
2. **Use GitHub Private Vulnerability Reporting** ([Security Advisories](https://github.com/ellmos-ai/n8n-manager-mcp/security/advisories/new))
3. Include description, reproduction steps, and potential impact

### How to Report

1. Navigate to: `Security` → `Advisories` → `New`
2. Fill out title, description, severity rating, and affected versions
3. Submit privately (not visible to the public until resolved and disclosed)

If Private Vulnerability Reporting is not yet active, please contact the security team directly via email at `security@open-bricks.org`, `security@ellmos.ai`, `support@lukasgeiger.com`, or `lukas@open-bricks.org`.

### Response Timeline & SLA

- **Initial Response:** Within **48 hours**
- **Triage & Confirmation:** Within **5 business days**
- **Patch Release:** As fast as possible following verification via GitHub Releases and npm registry

### Built-in Safety Controls & Invariants

- **Local-First & Loopback Binding:** The MCP server operates locally via stdio and connects to local n8n instances via `127.0.0.1` by default.
- **Monotonic Read-Only Mode:** Read-only mode blocks create, update, delete, activate/deactivate, import, and restore operations. Setting `N8N_MANAGER_READ_ONLY=1` enforces process-level read-only mode that cannot be overridden by persisted configuration or MCP tools.
- **Automated Workflow Backups:** Full workflow JSON is backed up automatically before update, delete, activate/deactivate, and overwrite-restore operations under `~/.n8n-manager-mcp/backups/`.
- **Local Audit Logging:** Mutation results are recorded locally to `~/.n8n-manager-mcp/audit.log`.
- **Input & Path Validation:** Backup path segments are sanitized and constrained to the configured root; traversal sequences and symlink escapes are rejected. Numeric limits (1..1000) and connection indices (0..1000) are strictly validated.
- **Process Isolation & Non-Elevation:** The server runs in user-space without elevated privileges.
- **Runtime Safety Inspection:** Use `n8n_safety_status` and `n8n_set_safety_mode` to inspect and govern active safety settings.
