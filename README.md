<img src="assets/n8n_logo.jpg" alt="n8n Manager MCP Server banner" width="700">

# n8n Manager MCP Server

**🇩🇪 [Deutsche Version](README_de.md)**

*Part of the [ellmos-ai](https://github.com/ellmos-ai) family.*

[![npm](https://img.shields.io/npm/v/n8n-manager-mcp.svg)](https://www.npmjs.com/package/n8n-manager-mcp)
[![Tests](https://github.com/ellmos-ai/n8n-manager-mcp/actions/workflows/tests.yml/badge.svg)](https://github.com/ellmos-ai/n8n-manager-mcp/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for managing n8n workflows via AI assistants like Claude, Cursor, and Windsurf.

## Directory Status

- [npm package](https://www.npmjs.com/package/n8n-manager-mcp): published as `n8n-manager-mcp`
- [Glama listing](https://glama.ai/mcp/servers/ellmos-ai/n8n-manager-mcp): public directory page for the ellmos-ai repo
- Official MCP Registry: this repo contains `server.json` and `mcpName` metadata for `io.github.ellmos-ai/n8n-manager-mcp`; the live registry still has the legacy `io.github.lukisch/n8n-manager-mcp` entry until the namespace is republished.

## Features

- **18 Tools** for complete n8n workflow management
- List, create, update, delete, and activate/deactivate workflows
- Safety controls: read-only mode, backup-before-delete/update, local restore, and audit log
- Multi-server support (connect to multiple n8n instances)
- Export/Import workflows between servers
- View execution history and status
- Built-in node catalog with descriptions
- Zero dependencies on Python -- connects directly to n8n REST API

## Installation

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Manual

```bash
npm install -g n8n-manager-mcp
```

## Quick Start

After installation, use these commands in your AI assistant:

1. **Add your n8n server:**
   > "Add my n8n server at http://localhost:5678 with API key abc123"

2. **List workflows:**
   > "Show me all workflows on my n8n server"

3. **Create a workflow:**
   > "Create an n8n workflow that triggers on a webhook, fetches data from an API, and sends a Slack message"

4. **Check executions:**
   > "Show me the last 10 workflow executions"

## Available Tools

| Tool | Description |
|------|-------------|
| `n8n_list_workflows` | List all workflows on a server |
| `n8n_get_workflow` | Get workflow details (nodes, connections) |
| `n8n_create_workflow` | Create a new workflow from nodes + connections |
| `n8n_update_workflow` | Update an existing workflow |
| `n8n_delete_workflow` | Delete a workflow |
| `n8n_activate_workflow` | Activate or deactivate a workflow |
| `n8n_list_executions` | List recent executions with status |
| `n8n_export_workflow` | Export workflow as importable JSON |
| `n8n_import_workflow` | Import workflow JSON onto a server |
| `n8n_safety_status` | Show local safety settings, backup directory, and audit log path |
| `n8n_set_safety_mode` | Toggle read-only mode, backup-before-mutation, and audit logging |
| `n8n_list_backups` | List local workflow backups created before mutations |
| `n8n_restore_workflow` | Restore a workflow from a local backup |
| `n8n_add_server` | Add/update n8n server connection |
| `n8n_list_servers` | List configured servers |
| `n8n_ping_server` | Test server connection |
| `n8n_remove_server` | Remove a server |
| `n8n_describe_nodes` | Browse available n8n node types |

## Configuration

Server connections and safety settings are stored in `~/.n8n-manager-mcp/servers.json`.

Safety defaults:

- `backup_before_mutations: true` saves workflow JSON before update, delete, activate/deactivate, and overwrite-restore operations.
- `audit_log: true` appends mutation outcomes to `~/.n8n-manager-mcp/audit.log`.
- `read_only: false` can be enabled with `n8n_set_safety_mode` or `N8N_MANAGER_READ_ONLY=1`.
- Backups are stored under `~/.n8n-manager-mcp/backups/` and can be listed/restored with the backup tools.

## Development

```bash
npm install
npm run build    # One-time build
npm run dev      # Watch mode
npm start        # Start server
npm test         # Run test suite (vitest)
npm run smoke    # Start the built MCP server and verify tool discovery
```

### Testing

The project includes **89 tests** covering URL building, server management, safety settings, backup path handling, workflow JSON construction, export/import validation, i18n language packs, and error handling.

```bash
npm test              # Run all tests
npx vitest run        # Same as above
npx vitest --watch    # Watch mode
npm run smoke         # Manual stdio MCP smoke test (requires npm run build first)
```

Tests are verified on **Windows**, **macOS**, and **Linux**.
GitHub Actions additionally runs build, test, and npm package checks on Node.js 20, 22, and 24.
The smoke runner starts `dist/index.js` through the MCP SDK client, verifies all 18 tool registrations, and calls the safe `n8n_describe_nodes` catalog tool without requiring n8n credentials.

## Related

- [n8n-workflow-manager](https://github.com/ellmos-ai/n8n-workflow-manager) -- Full web UI + REST API for n8n workflow management (Python)
- [n8n](https://n8n.io/) -- The workflow automation platform

## License

MIT

---

## ellmos-ai Ecosystem

This MCP server is part of the **[ellmos-ai](https://github.com/ellmos-ai)** ecosystem — AI infrastructure, MCP servers, and intelligent tools.

### MCP Server Family

| Server | Tools | Focus | npm |
|--------|-------|-------|-----|
| [FileCommander](https://github.com/ellmos-ai/ellmos-filecommander-mcp) | 43 | Filesystem, process management, interactive sessions | [`ellmos-filecommander-mcp`](https://www.npmjs.com/package/ellmos-filecommander-mcp) |
| [CodeCommander](https://github.com/ellmos-ai/ellmos-codecommander-mcp) | 17 | Code analysis, AST parsing, import management | [`ellmos-codecommander-mcp`](https://www.npmjs.com/package/ellmos-codecommander-mcp) |
| [Clatcher](https://github.com/ellmos-ai/ellmos-clatcher-mcp) | 12 | File repair, format conversion, batch operations | [`ellmos-clatcher-mcp`](https://www.npmjs.com/package/ellmos-clatcher-mcp) |
| **[n8n Manager](https://github.com/ellmos-ai/n8n-manager-mcp)** | **18** | **n8n workflow management via AI assistants** | **[`n8n-manager-mcp`](https://www.npmjs.com/package/n8n-manager-mcp)** |
| [ControlCenter](https://github.com/ellmos-ai/ellmos-controlcenter-mcp) | 10 | MCP stack discovery, profile management, control plane | [`ellmos-controlcenter-mcp`](https://www.npmjs.com/package/ellmos-controlcenter-mcp) |

### AI Infrastructure

| Project | Description |
|---------|-------------|
| [BACH](https://github.com/ellmos-ai/bach) | Text-based OS for LLMs — 109+ handlers, 373+ tools, 932+ skills |
| [clutch](https://github.com/ellmos-ai/clutch) | Provider-neutral LLM orchestration with auto-routing and budget tracking |
| [rinnsal](https://github.com/ellmos-ai/rinnsal) | Lightweight agent memory, connectors, and automation infrastructure |
| [ellmos-stack](https://github.com/ellmos-ai/ellmos-stack) | Self-hosted AI research stack (Ollama + n8n + Rinnsal + KnowledgeDigest) |
| [MarbleRun](https://github.com/ellmos-ai/MarbleRun) | Autonomous agent chain framework for Claude Code |
| [gardener](https://github.com/ellmos-ai/gardener) | Minimalist database-driven LLM OS prototype (4 functions, 1 table) |
| [ellmos-tests](https://github.com/ellmos-ai/ellmos-tests) | Testing framework for LLM operating systems (7 dimensions) |

### Desktop Software

Our partner organization **[open-bricks](https://github.com/open-bricks)** bundles AI-native desktop applications — a modern, open-source software suite built for the age of AI. Categories include file management, document tools, developer utilities, and more.

---

## Haftung / Liability

Dieses Projekt ist eine **unentgeltliche Open-Source-Schenkung** im Sinne der §§ 516 ff. BGB. Die Haftung des Urhebers ist gemäß **§ 521 BGB** auf **Vorsatz und grobe Fahrlässigkeit** beschränkt. Ergänzend gilt der Haftungsausschluss der MIT-Lizenz.

Nutzung auf eigenes Risiko. Keine Wartungszusage, keine Verfügbarkeitsgarantie, keine Gewähr für Fehlerfreiheit oder Eignung für einen bestimmten Zweck.

This project is an unpaid open-source donation under the MIT License. Liability is limited to intent and gross negligence (§ 521 German Civil Code). Use at your own risk. No warranty, no maintenance guarantee, no fitness-for-purpose assumed.

