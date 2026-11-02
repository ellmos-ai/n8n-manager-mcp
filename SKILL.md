---
name: n8n-manager-mcp
version: 0.1.21
type: product-skill
author: ellmos-ai
created: 2026-11-02
updated: 2026-11-02
status: production
description: >
  Comprehensive Model Context Protocol (MCP) server for end-to-end n8n workflow management:
  list, inspect, create, update, delete, activate, export, import, inspect executions,
  manage multiple n8n instances, and browse the built-in node catalog.
---

# n8n-manager-mcp — Product Skill

## 1. Overview & Capabilities

`n8n-manager-mcp` is a production-grade Model Context Protocol (MCP) server designed to enable AI assistants (Claude, Cursor, Windsurf, Codex, Gemini) to inspect and manage n8n workflows through the official n8n REST API without any Python runtime dependency.

### Core Capabilities
- **Complete Workflow Lifecycle:** List workflows with pagination, retrieve full node graph and connection topologies, create new workflows, update existing workflows, delete workflows, and toggle active status.
- **Portability & Migration:** Export workflows to standard JSON and import workflows across environments or instances.
- **Safety & Rollback Guardrails:** Monotonic read-only mode, automated pre-mutation backups (`INV-BACK-03`), local rollback restore, and append-only forensic audit trail (`INV-AUDIT-04`).
- **Multi-Server Management:** Register, list, ping, and remove multiple n8n server profiles (`INV-SRV-05`) with default server selection semantics.
- **Offline Node Catalog:** Static introspection catalog (`src/nodes.ts`, `INV-NODE-09`) providing node descriptions, inputs, outputs, and parameters without runtime API calls.
- **Execution Observability:** Retrieve recent workflow executions with detailed run status, error payloads, and timestamps.
- **Opt-In Decision History:** Clean adapter for `n8n-workflow-manager` (`INV-SEAM-08`) when configured via `N8N_MCP_MANAGER_URL`.

### Out-of-Scope & Guardrails
- Does not bypass n8n API authentication or credential protection.
- Does not execute arbitrary shell commands or access filesystem paths outside configured directories.
- Does not collect or transmit telemetry, user metrics, or network pings (`INV-LOCAL-01`).
- Runs strictly in unprivileged user space (`INV-PRIV-07`, `RunAsInvoker`).

---

## 2. Prerequisites & Environment

- **Node.js:** `>=20.0.0` (Active and Maintenance LTS: Node.js 20 and 22).
- **n8n Instance:** Accessible n8n REST API with a valid API key (Admin API key created in n8n Settings > n8n API).
- **Environment Variables:**
  - `N8N_API_URL`: Base URL of the primary n8n instance (e.g. `http://localhost:5678` or `https://n8n.example.com`).
  - `N8N_API_KEY`: Secret API key for n8n REST API authentication.
  - `N8N_MANAGER_READ_ONLY`: Set to `1` or `true` to enforce process-level read-only ceiling (`INV-READ-02`).
  - `N8N_MCP_MANAGER_URL`: Optional URL for the companion `n8n-workflow-manager` service (`INV-SEAM-08`).

---

## 3. Installation & Configuration

### Stdio Transport (Claude Desktop / Claude Code / Cursor / Windsurf)

Add to `claude_desktop_config.json` or `.mcp.json`:

```json
{
  "mcpServers": {
    "n8n-manager": {
      "command": "npx",
      "args": ["-y", "n8n-manager-mcp"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

Or run directly from a local repository clone:

```json
{
  "mcpServers": {
    "n8n-manager": {
      "command": "node",
      "args": ["C:/_Local_DEV/repos/n8n-manager-mcp/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

---

## 4. Available Tools Reference (19 Tools)

| Tool Name | Parameters | Purpose | Safety / Risk |
| :--- | :--- | :--- | :--- |
| `n8n_list_workflows` | `limit`, `cursor`, `tags`, `active`, `server` | List workflows with pagination and filters | Read-Only |
| `n8n_get_workflow` | `id`, `server` | Retrieve complete workflow JSON, nodes, and connections | Read-Only |
| `n8n_create_workflow` | `name`, `nodes`, `connections`, `settings`, `server` | Create a new workflow from node graphs | Mutation |
| `n8n_update_workflow` | `id`, `name`, `nodes`, `connections`, `settings`, `server` | Update an existing workflow (captures pre-mutation backup) | Mutation |
| `n8n_delete_workflow` | `id`, `server` | Delete a workflow (captures pre-deletion backup) | Mutation |
| `n8n_activate_workflow` | `id`, `active`, `server` | Toggle workflow activation state (on/off) | Mutation |
| `n8n_export_workflow` | `id`, `server` | Export workflow as portable importable JSON | Read-Only |
| `n8n_import_workflow` | `workflow`, `name`, `server` | Import workflow JSON into the target server | Mutation |
| `n8n_list_executions` | `workflowId`, `limit`, `status`, `server` | Inspect execution history and error payloads | Read-Only |
| `n8n_describe_nodes` | `category`, `nodeType`, `query` | Offline catalog of triggers, actions, and transforms | Read-Only (Offline) |
| `n8n_safety_status` | *(none)* | Inspect active safety mode, read-only status, backup path | Read-Only (Local) |
| `n8n_set_safety_mode` | `readOnly`, `backupBeforeMutate` | Adjust runtime safety settings (unless process ceiling active) | Local Config |
| `n8n_list_backups` | `workflowId` | List local backup snapshots stored under `~/.n8n-manager-mcp/` | Read-Only (Local) |
| `n8n_restore_workflow` | `backupPath`, `server` | Restore workflow from a previously captured backup snapshot | Mutation |
| `n8n_add_server` | `name`, `url`, `apiKey`, `isDefault` | Register an additional n8n instance profile | Local Config |
| `n8n_list_servers` | *(none)* | List configured n8n servers (API keys masked) | Read-Only (Local) |
| `n8n_remove_server` | `name` | Remove a configured server profile | Local Config |
| `n8n_ping_server` | `server` | Check API connectivity and response time | Network Read |
| `n8n_manager_history` | `workflowId`, `limit` | Opt-in decision history from `n8n-workflow-manager` | Read-Only (Adapter) |

---

## 5. Human & Agent Execution Patterns

### A. Pre-Flight Inspection (Read-Only)
Before modifying any workflow, query status and inventory:
```json
// Check safety configuration
{ "name": "n8n_safety_status", "arguments": {} }

// List existing workflows
{ "name": "n8n_list_workflows", "arguments": { "limit": 20 } }

// Retrieve workflow topology
{ "name": "n8n_get_workflow", "arguments": { "id": "42" } }
```

### B. Safe Workflow Modification
When creating or updating workflows:
1. Verify nodes and parameters with `n8n_describe_nodes`.
2. Apply mutation via `n8n_update_workflow` (an automatic snapshot is stored in `~/.n8n-manager-mcp/backups/`).
3. Verify updated topology with `n8n_get_workflow`.
4. If testing execution, check execution status with `n8n_list_executions`.

### C. Incident Recovery & Rollback
If a workflow modification introduces errors:
1. List available backups: `n8n_list_backups(workflowId="42")`.
2. Inspect backup payload on disk.
3. Restore previous version: `n8n_restore_workflow(backupPath="...")`.

---

## 6. Governance & Runtime Invariants

- **`INV-LOCAL-01`**: Zero external telemetry, tracking, or unexpected egress.
- **`INV-READ-02`**: Monotonic read-only enforcement via `N8N_MANAGER_READ_ONLY=1`.
- **`INV-BACK-03`**: Pre-mutation automated JSON snapshot capture before all destructive actions.
- **`INV-AUDIT-04`**: Structured append-only forensic audit trail in `~/.n8n-manager-mcp/audit.log`.
- **`INV-SRV-05`**: Multi-instance isolation in `~/.n8n-manager-mcp/servers.json`.
- **`INV-TRAV-06`**: Input validation via Zod schemas and path sanitization preventing directory traversal.
- **`INV-PRIV-07`**: Execution strictly as unprivileged user (`RunAsInvoker`).
- **`INV-SEAM-08`**: Fail-fast integration seam for `n8n-workflow-manager`.
- **`INV-NODE-09`**: Bundled offline node catalog for zero-network schema lookups.
- **`INV-SLA-10`**: Multi-Node CI matrix (Node.js 20 and 22) with concurrency control and 48h security SLA.

---

## 7. Verification & Smoke Testing

To verify server health and tool registration locally:

```bash
# Run complete Vitest suite (205 tests)
npm test

# Build TypeScript to dist/
npm run build

# Execute stdio MCP smoke client (verifies all 19 tools)
npm run smoke

# Package dry-run validation
npm pack --dry-run --json
```
