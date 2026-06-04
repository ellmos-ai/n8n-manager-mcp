<img src="assets/n8n_logo.jpg" alt="n8n Manager MCP Server Banner" width="700">

# n8n Manager MCP Server

**🇬🇧 [English Version](README.md)**

*Teil der [ellmos-ai](https://github.com/ellmos-ai)-Familie.*

[![npm](https://img.shields.io/npm/v/n8n-manager-mcp.svg)](https://www.npmjs.com/package/n8n-manager-mcp)
[![Tests](https://github.com/ellmos-ai/n8n-manager-mcp/actions/workflows/tests.yml/badge.svg)](https://github.com/ellmos-ai/n8n-manager-mcp/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP-Server (Model Context Protocol) zur Verwaltung von n8n-Workflows über KI-Assistenten wie Claude, Cursor und Windsurf.

## Verzeichnis-Status

- [npm-Paket](https://www.npmjs.com/package/n8n-manager-mcp): veröffentlicht als `n8n-manager-mcp`
- [Glama-Eintrag](https://glama.ai/mcp/servers/ellmos-ai/n8n-manager-mcp): öffentliche Verzeichnisseite für das ellmos-ai-Repo
- Offizielle MCP Registry: Dieses Repo enthält `server.json` und `mcpName`-Metadaten für `io.github.ellmos-ai/n8n-manager-mcp`; live steht dort noch der ältere Eintrag `io.github.lukisch/n8n-manager-mcp`, bis der Namespace neu veröffentlicht wird.

## Funktionen

- **18 Tools** für vollständige n8n-Workflow-Verwaltung
- Workflows auflisten, erstellen, aktualisieren, löschen und aktivieren/deaktivieren
- Sicherheitsfunktionen: Read-only-Modus, Backup vor Löschen/Aktualisieren, lokale Wiederherstellung und Audit-Log
- Multi-Server-Unterstützung (Verbindung zu mehreren n8n-Instanzen)
- Export/Import von Workflows zwischen Servern
- Ausführungshistorie und Status einsehen
- Integrierter Node-Katalog mit Beschreibungen
- Keine Python-Abhängigkeiten — direkte Verbindung zur n8n REST API

## Installation

### Claude Desktop

In `claude_desktop_config.json` einfügen:

```json
{
  "mcpServers": {
    "n8n-manager": {
      "command": "npx",
      "args": ["-y", "n8n-manager-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add --scope user n8n-manager npx -y n8n-manager-mcp
```

### Manuell

```bash
npm install -g n8n-manager-mcp
```

## Schnellstart

Nach der Installation können folgende Befehle im KI-Assistenten verwendet werden:

1. **n8n-Server hinzufügen:**
   > „Füge meinen n8n-Server unter http://localhost:5678 mit API-Key abc123 hinzu"

2. **Workflows auflisten:**
   > „Zeige mir alle Workflows auf meinem n8n-Server"

3. **Workflow erstellen:**
   > „Erstelle einen n8n-Workflow, der bei einem Webhook auslöst, Daten von einer API abruft und eine Slack-Nachricht sendet"

4. **Ausführungen prüfen:**
   > „Zeige mir die letzten 10 Workflow-Ausführungen"

## Verfügbare Tools

| Tool | Beschreibung |
|------|-------------|
| `n8n_list_workflows` | Alle Workflows eines Servers auflisten |
| `n8n_get_workflow` | Workflow-Details abrufen (Nodes, Verbindungen) |
| `n8n_create_workflow` | Neuen Workflow aus Nodes + Verbindungen erstellen |
| `n8n_update_workflow` | Bestehenden Workflow aktualisieren |
| `n8n_delete_workflow` | Workflow löschen |
| `n8n_activate_workflow` | Workflow aktivieren oder deaktivieren |
| `n8n_list_executions` | Letzte Ausführungen mit Status auflisten |
| `n8n_export_workflow` | Workflow als importierbares JSON exportieren |
| `n8n_import_workflow` | Workflow-JSON auf einen Server importieren |
| `n8n_safety_status` | Lokale Sicherheitseinstellungen, Backup-Ordner und Audit-Log-Pfad anzeigen |
| `n8n_set_safety_mode` | Read-only-Modus, Backup vor Änderungen und Audit-Logging umschalten |
| `n8n_list_backups` | Lokale Workflow-Backups auflisten |
| `n8n_restore_workflow` | Workflow aus einem lokalen Backup wiederherstellen |
| `n8n_add_server` | n8n-Serververbindung hinzufügen/aktualisieren |
| `n8n_list_servers` | Konfigurierte Server auflisten |
| `n8n_ping_server` | Serververbindung testen |
| `n8n_remove_server` | Server entfernen |
| `n8n_describe_nodes` | Verfügbare n8n-Node-Typen durchsuchen |

## Konfiguration

Serververbindungen und Sicherheitseinstellungen werden in `~/.n8n-manager-mcp/servers.json` gespeichert.

Sicherheitsstandard:

- `backup_before_mutations: true` speichert Workflow-JSON vor Aktualisieren, Löschen, Aktivieren/Deaktivieren und überschreibender Wiederherstellung.
- `audit_log: true` schreibt Ergebnisse von Änderungen nach `~/.n8n-manager-mcp/audit.log`.
- `read_only: false` kann mit `n8n_set_safety_mode` oder `N8N_MANAGER_READ_ONLY=1` aktiviert werden.
- Backups liegen unter `~/.n8n-manager-mcp/backups/` und können mit den Backup-Tools aufgelistet oder wiederhergestellt werden.

## Entwicklung

```bash
npm install
npm run build    # Einmaliger Build
npm run dev      # Watch-Modus
npm start        # Server starten
npm test         # Tests ausführen (vitest)
```

### Tests

Das Projekt enthält eine umfassende Test-Suite mit **89 Tests** für die Kernlogik aller 18 Tools, i18n-Sprachpakete und Fehlerbehandlung.

```bash
npm test              # Alle Tests ausführen
npx vitest run        # Gleiche Funktion
npx vitest --watch    # Watch-Modus
```

Tests sind auf **Windows**, **macOS** und **Linux** verifiziert.
GitHub Actions führt zusätzlich Build, Tests und npm-Paketprüfung auf Node.js 20, 22 und 24 aus.

## Verwandte Projekte

- [n8n-workflow-manager](https://github.com/ellmos-ai/n8n-workflow-manager) — Vollständige Web-UI + REST API für n8n-Workflow-Verwaltung (Python)
- [n8n](https://n8n.io/) — Die Workflow-Automatisierungsplattform

## Lizenz

MIT

---

## ellmos-ai-Ökosystem

Dieser MCP-Server ist Teil des **[ellmos-ai](https://github.com/ellmos-ai)**-Ökosystems: KI-Infrastruktur, MCP-Server und intelligente Werkzeuge.

### MCP-Server-Familie

| Server | Tools | Fokus | npm |
|--------|-------|-------|-----|
| [FileCommander](https://github.com/ellmos-ai/ellmos-filecommander-mcp) | 43 | Dateisystem, Prozessverwaltung, interaktive Sitzungen | [`ellmos-filecommander-mcp`](https://www.npmjs.com/package/ellmos-filecommander-mcp) |
| [CodeCommander](https://github.com/ellmos-ai/ellmos-codecommander-mcp) | 17 | Code-Analyse, AST-Parsing, Import-Verwaltung | [`ellmos-codecommander-mcp`](https://www.npmjs.com/package/ellmos-codecommander-mcp) |
| [Clatcher](https://github.com/ellmos-ai/ellmos-clatcher-mcp) | 12 | Dateireparatur, Formatkonvertierung, Batch-Operationen | [`ellmos-clatcher-mcp`](https://www.npmjs.com/package/ellmos-clatcher-mcp) |
| **[n8n Manager](https://github.com/ellmos-ai/n8n-manager-mcp)** | **18** | **n8n-Workflow-Verwaltung über KI-Assistenten** | **[`n8n-manager-mcp`](https://www.npmjs.com/package/n8n-manager-mcp)** |
| [ControlCenter](https://github.com/ellmos-ai/ellmos-controlcenter-mcp) | 10 | MCP-Stack-Discovery, Profilverwaltung, Control Plane | [`ellmos-controlcenter-mcp`](https://www.npmjs.com/package/ellmos-controlcenter-mcp) |

### KI-Infrastruktur

| Projekt | Beschreibung |
|---------|-------------|
| [BACH](https://github.com/ellmos-ai/bach) | Textbasiertes Betriebssystem für LLMs: Handler, Tools und Skills |
| [clutch](https://github.com/ellmos-ai/clutch) | Provider-neutrale LLM-Orchestrierung mit Auto-Routing und Budget-Tracking |
| [rinnsal](https://github.com/ellmos-ai/rinnsal) | Leichte Agent-Memory-, Connector- und Automatisierungsinfrastruktur |
| [ellmos-stack](https://github.com/ellmos-ai/ellmos-stack) | Self-hosted AI Research Stack |
| [MarbleRun](https://github.com/ellmos-ai/MarbleRun) | Autonomes Agent-Chain-Framework für Claude Code |
| [gardener](https://github.com/ellmos-ai/gardener) | Minimalistischer datenbankgetriebener LLM-OS-Prototyp |
| [ellmos-tests](https://github.com/ellmos-ai/ellmos-tests) | Testframework für LLM-Betriebssysteme |

### Desktop-Software

Unsere Partnerorganisation **[open-bricks](https://github.com/open-bricks)** bündelt KI-native Desktop-Anwendungen: eine moderne Open-Source-Softwaresuite für Datei-, Dokumenten- und Entwicklerwerkzeuge.
