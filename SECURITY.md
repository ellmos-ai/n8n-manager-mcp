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
- **Behebungszusage (Remediation SLA):** Verbindliche Behebung und Bereitstellung eines Sicherheitspatches innerhalb von maximal **30 Tagen** nach Bestätigung einer gemeldeten Schwachstelle
- **Patch-Bereitstellung:** Zeitnah nach Verifikation über GitHub Releases und npm Registry

### Integrierte Schutz- und Sicherheitsmechanismen

- **Lokaler MCP-Transport:** Der MCP-Server verwendet Stdio und öffnet keinen eigenen MCP-Netzwerkport. Konfigurierte n8n-Endpunkte erhalten REST-Anfragen; ihre Adresse kann lokal oder entfernt sein. Ein Update-Check ist nur beim interaktiven Terminalstart vorgesehen (`stdout.isTTY`), nicht im regulären Stdio-MCP-Betrieb.
- **Read-Only Schutzmodus:** Der Nur-Lese-Modus blockiert Operationen zum Erstellen, Aktualisieren, Löschen, Aktivieren/Deaktivieren, Importieren und Wiederherstellen von Workflows. Über `N8N_MANAGER_READ_ONLY=1` wird dieser Modus prozessweit monoton erzwungen und kann nicht durch persistierte Einstellungen überschrieben werden.
- **Konfigurierbare Workflow-Backups:** Wenn `backup_before_mutations` aktiviert ist (Standard: true), wird vor Update, Löschen, Aktivieren/Deaktivieren und überschreibendem Restore ein lokales JSON-Backup unter `~/.n8n-manager-mcp/backups/` angelegt. Ein fehlgeschlagenes aktiviertes Backup verhindert diese nachfolgende Mutation; deaktivierte Backups bieten diesen Schutz nicht.
- **Konfigurierbare Audit-Protokollierung:** Bei aktiviertem `audit_log` (Standard: true) werden protokollierte Mutationsausgänge lokal an `~/.n8n-manager-mcp/audit.log` angehängt. Die Datei ist nicht manipulationssicher. Schreibfehler werden weitergereicht und können auch nach einer bereits ausgeführten Remote-Mutation auftreten; ein Fehlerresultat beweist daher keine Rücknahme.
- **Eingabe- und Pfadvalidierung:** Backup-Pfadsegmente werden bereinigt und für die betroffenen Backup-, Listen- und Restore-Operationen auf den konfigurierten Root begrenzt; numerische Limits (1..1000) und Verbindungsindizes (0..1000) werden validiert.
- **Prozessrechte:** Der Server benötigt im vorgesehenen Betrieb keine administrativen Rechte und fordert keine Erhöhung an. Er erbt die Rechte des startenden Prozesses; eine technische Rechteabsenkung oder eine RunAsInvoker-Manifestgarantie ist nicht implementiert.
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
- **Remediation SLA:** Binding resolution and security patch release within a maximum of **30 days** following confirmation of a reported vulnerability
- **Patch Release:** As fast as possible following verification via GitHub Releases and npm registry

### Built-in Safety Controls & Invariants

- **Local MCP Transport:** The MCP server uses stdio and opens no MCP network listening port. Configured n8n endpoints receive REST requests and can be local or remote. An update check is invoked only during interactive terminal startup (`stdout.isTTY`), not regular stdio MCP operation.
- **Monotonic Read-Only Mode:** Read-only mode blocks create, update, delete, activate/deactivate, import, and restore operations. Setting `N8N_MANAGER_READ_ONLY=1` enforces process-level read-only mode that cannot be overridden by persisted configuration or MCP tools.
- **Configurable Workflow Backups:** When `backup_before_mutations` is enabled (default: true), workflow JSON is backed up before update, delete, activate/deactivate, and overwrite-restore operations under `~/.n8n-manager-mcp/backups/`. Failure of an enabled backup prevents that following mutation; disabled backups provide no such protection.
- **Configurable Local Audit Logging:** When `audit_log` is enabled (default: true), logged mutation outcomes are appended to `~/.n8n-manager-mcp/audit.log`. The file is not tamper-proof. Write errors propagate and may occur after a remote mutation has already succeeded; an error result therefore does not prove rollback.
- **Input & Path Validation:** Backup path segments are sanitized and constrained to the configured root; traversal sequences and symlink escapes are rejected. Numeric limits (1..1000) and connection indices (0..1000) are strictly validated.
- **Process Privileges:** Intended operation does not require administrator privileges and the server does not request elevation. It inherits the launching process privileges; no privilege-dropping mechanism or RunAsInvoker manifest guarantee is implemented.
- **Runtime Safety Inspection:** Use `n8n_safety_status` and `n8n_set_safety_mode` to inspect and govern active safety settings.
