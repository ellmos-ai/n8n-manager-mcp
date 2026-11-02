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
- **Workflow Lifecycle:** List workflows up to the requested limit, retrieve full node graphs and connections, create, update, delete, and toggle active status. The list tool does not expose cursor, tag, or active-state filters.
- **Portability & Migration:** Export workflows to standard JSON and import workflows across environments or instances.
- **Safety & Rollback Guardrails:** Monotonic read-only mode, automated pre-mutation backups (`INV-BACK-03`), local rollback restore, and append-only forensic audit trail (`INV-AUDIT-04`).
- **Multi-Server Management:** Register, list, ping, and remove multiple n8n server profiles (`INV-SRV-05`) with default server selection semantics.
- **Offline Node Catalog:** Bundled catalog in `src/index.ts` (`INV-NODE-09`) providing short node descriptions and parameter hints, filtered by category, without runtime API calls. It is not a complete n8n node-schema endpoint.
- **Execution Observability:** Retrieve recent workflow executions with detailed run status, error payloads, and timestamps.
- **Opt-In Decision History:** Clean adapter for `n8n-workflow-manager` (`INV-SEAM-08`) when configured via `N8N_MCP_MANAGER_URL`.

### Out-of-Scope & Guardrails
- Does not bypass n8n API authentication or credential protection.
- Does not execute arbitrary shell commands or access filesystem paths outside configured directories.
- Does not collect or transmit telemetry, user metrics, or network pings (`INV-LOCAL-01`).
- Runs strictly in unprivileged user space (`INV-PRIV-07`, `RunAsInvoker`).

---

## 2. Prerequisites & Environment

- **Node.js:** `>=20.0.0` as declared by the package; the current CI matrix tests Node.js 20 and 22.
- **n8n Instance:** Accessible n8n REST API with an API key that has the permissions required for the intended operation.
- **Environment Variables:**
  - `N8N_MANAGER_SERVER_URL`: Host-pinned n8n URL (e.g. `http://localhost:5678` or `https://n8n.example.com`). A new or rotated server profile must match this URL.
  - `N8N_MANAGER_API_KEY`: Secret n8n API key supplied by the MCP host. Never pass the key as an MCP tool argument. Existing profiles retain their stored key unless `rotate_key` is explicitly true.
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
        "N8N_MANAGER_SERVER_URL": "http://localhost:5678",
        "N8N_MANAGER_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

After configuring the host environment, register the profile once. Environment variables do not automatically register a server. The URL must match `N8N_MANAGER_SERVER_URL`; the key comes only from `N8N_MANAGER_API_KEY` in the host environment:

```json
{
  "name": "n8n_add_server",
  "arguments": {
    "name": "local",
    "url": "http://localhost:5678",
    "is_default": true
  }
}
```

---

## 4. Available Tools Reference (19 Tools)

| Tool Name | Parameters | Purpose | Safety / Risk |
| :--- | :--- | :--- | :--- |
| `n8n_list_workflows` | `server_name`, `limit` | List workflows up to the requested limit | Read-Only |
| `n8n_get_workflow` | `workflow_id`, `server_name` | Retrieve complete workflow JSON, nodes, and connections | Read-Only |
| `n8n_create_workflow` | `name`, `nodes`, `connections`, `server_name`, `activate` | Create a workflow from node graphs; activation defaults to false | Mutation |
| `n8n_update_workflow` | `workflow_id`, `workflow_json`, `server_name` | Send full workflow JSON as a string; backup first when enabled | Mutation |
| `n8n_delete_workflow` | `workflow_id`, `server_name` | Delete a workflow; backup first when enabled | Mutation |
| `n8n_activate_workflow` | `workflow_id`, `active`, `server_name` | Toggle workflow activation state (on/off) | Mutation |
| `n8n_export_workflow` | `workflow_id`, `server_name` | Export workflow as portable importable JSON | Read-Only |
| `n8n_import_workflow` | `workflow_json`, `server_name`, `activate` | Import JSON supplied as a string; activation defaults to false | Mutation |
| `n8n_list_executions` | `workflow_id`, `status`, `limit`, `server_name` | Inspect execution history and error payloads | Read-Only |
| `n8n_describe_nodes` | `category` | Browse the offline catalog by category | Read-Only (Offline) |
| `n8n_safety_status` | *(none)* | Inspect active safety mode, read-only status, backup path | Read-Only (Local) |
| `n8n_set_safety_mode` | `read_only`, `backup_before_mutations`, `audit_log` | Adjust local safety settings; cannot lower the process read-only ceiling | Local Config |
| `n8n_list_backups` | `server_name`, `workflow_id`, `limit` | List local backup snapshots stored under `~/.n8n-manager-mcp/` | Read-Only (Local) |
| `n8n_restore_workflow` | `backup_path`, `server_name`, `target_workflow_id`, `activate` | Create a new inactive workflow by default; overwrite only with explicit target ID | Mutation |
| `n8n_add_server` | `name`, `url`, `rotate_key`, `is_default` | Register/update a profile using the host-supplied key and pinned URL | Local Config |
| `n8n_list_servers` | *(none)* | List configured n8n servers (API keys masked) | Read-Only (Local) |
| `n8n_remove_server` | `server_name` | Remove a configured server profile | Local Config |
| `n8n_ping_server` | `server_name` | Check API connectivity and response time | Network Read |
| `n8n_manager_history` | `workflow_id`, `limit` | Opt-in decision history; workflow_id is the numeric manager ID | Read-Only (Adapter) |

Parameter names above match the offered MCP schemas exactly. n8n workflow IDs are strings; `n8n_manager_history.workflow_id` is a numeric manager ID. `workflow_json` is a JSON-encoded string, not a nested object. List limits are integers from 1 to 1000; history limit is 1 to 500. Omit `server_name` to use the configured default. Query `tools/list` for required fields and complete input types.

---

## 5. Human & Agent Execution Patterns

### A. Pre-Flight Inspection (Read-Only)
Before modifying any workflow, query status and inventory. To enable local read-only mode, use the exact snake_case tool argument and verify the returned status. A process ceiling from `N8N_MANAGER_READ_ONLY=1` remains in force even if local settings change:
```json
{ "name": "n8n_set_safety_mode", "arguments": { "read_only": true } }
```

```json
{ "name": "n8n_safety_status", "arguments": {} }
```

```json
{ "name": "n8n_list_workflows", "arguments": { "limit": 20 } }
```

```json
{ "name": "n8n_get_workflow", "arguments": { "workflow_id": "42" } }
```

### B. Safe Workflow Modification
When creating or updating workflows:
1. Inspect the existing graph with `n8n_get_workflow`; use `n8n_describe_nodes` for category-based hints, not complete schema validation.
2. Only when authorized to write, verify read-only and backup settings with `n8n_safety_status`. Writes are blocked while read-only mode is active; the host ceiling cannot be bypassed by a tool call.
3. Apply `n8n_update_workflow` with `workflow_id`, full `workflow_json` as a string, and optional `server_name`. With backup-before-mutation enabled (the default), an existing snapshot is saved under `~/.n8n-manager-mcp/backups/` before the update.
4. Verify updated topology with `n8n_get_workflow`.
5. Inspect existing execution status with `n8n_list_executions`; this tool does not start an execution.

### C. Incident Recovery & Rollback
If a workflow modification introduces errors:
1. List available backups using `workflow_id` and optional `server_name`/`limit`.
2. Inspect backup payload on disk.
3. Restore using `backup_path`. By default this creates a **new, inactive workflow**; it does not roll back the original workflow in place. To overwrite an existing workflow, supply its explicit `target_workflow_id` only when authorized. `activate` defaults to false.

```json
{
  "name": "n8n_restore_workflow",
  "arguments": { "backup_path": "/path/returned/by/n8n_list_backups.json", "activate": false }
}
```

---

## 6. Governance & Runtime Invariants

- **`INV-LOCAL-01`**: Zero external telemetry, tracking, or unexpected egress.
- **`INV-READ-02`**: Monotonic read-only enforcement via `N8N_MANAGER_READ_ONLY=1`.
- **`INV-BACK-03`**: Backup-before-mutation is enabled by default for existing workflow update/delete/activate/restore; inspect the effective safety settings before relying on it.
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
# Run complete Vitest suite (208 tests)
npm test

# Build TypeScript to dist/
npm run build

# Execute stdio MCP smoke client (19 tools, product-skill schemas and examples)
npm run smoke

# Package dry-run validation
npm pack --dry-run --json
```
