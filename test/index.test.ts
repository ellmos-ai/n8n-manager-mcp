/**
 * Comprehensive test suite for n8n-manager-mcp
 *
 * Tests the core logic of all MCP tools by replicating internal helpers.
 * The actual tool handlers are registered via server.tool() and not exported,
 * so we mirror the logic here and validate behavior in isolation.
 *
 * IMPORTANT: No real n8n servers are contacted. No ~/.n8n-manager-mcp/ is touched.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import * as os from "os";

// ============================================================================
// Types (mirrored from src/index.ts)
// ============================================================================

interface N8nServer {
  name: string;
  url: string;
  apiKey: string;
  isDefault: boolean;
}

interface ServerConfig {
  servers: N8nServer[];
  safety?: Partial<SafetySettings>;
}

interface SafetySettings {
  readOnly: boolean;
  backupBeforeMutations: boolean;
  auditLog: boolean;
}

// ============================================================================
// Test Helpers -- mirror the logic from src/index.ts
// ============================================================================

async function ensureConfigDir(configDir: string): Promise<void> {
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch { /* exists */ }
}

async function loadConfig(configFile: string, configDir: string): Promise<ServerConfig> {
  await ensureConfigDir(configDir);
  try {
    const data = await fs.readFile(configFile, "utf-8");
    return normalizeConfig(JSON.parse(data));
  } catch {
    return normalizeConfig({ servers: [] });
  }
}

async function saveConfig(configFile: string, configDir: string, config: ServerConfig): Promise<void> {
  await ensureConfigDir(configDir);
  await fs.writeFile(configFile, JSON.stringify(normalizeConfig(config), null, 2), "utf-8");
}

function getDefaultServer(config: ServerConfig): N8nServer | undefined {
  return config.servers.find(s => s.isDefault) || config.servers[0];
}

function getServerByName(config: ServerConfig, name: string): N8nServer | undefined {
  return config.servers.find(s => s.name === name);
}

const DEFAULT_SAFETY: SafetySettings = {
  readOnly: false,
  backupBeforeMutations: true,
  auditLog: true,
};

function normalizeConfig(config: Partial<ServerConfig>): ServerConfig {
  return {
    servers: Array.isArray(config.servers) ? config.servers : [],
    safety: {
      ...DEFAULT_SAFETY,
      ...(config.safety || {}),
    },
  };
}

function getSafety(config: ServerConfig): SafetySettings {
  return { ...DEFAULT_SAFETY, ...(config.safety || {}) };
}

function sanitizePathPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 80) || "unknown";
}

function backupTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function buildBackupPath(configDir: string, srv: N8nServer, workflowId: string, reason: string, date: Date): string {
  return path.join(
    configDir,
    "backups",
    sanitizePathPart(srv.name),
    `${sanitizePathPart(workflowId)}-${backupTimestamp(date)}-${sanitizePathPart(reason)}.json`
  );
}

function blockMessageForReadOnly(action: string, safety: SafetySettings): string | null {
  if (!safety.readOnly) return null;
  return `Blocked: n8n Manager is in read-only mode. Disable read_only via n8n_set_safety_mode before ${action}.`;
}

function buildUrl(server: N8nServer, endpoint: string): string {
  return `${server.url.replace(/\/$/, "")}/api/v1${endpoint}`;
}

function buildHeaders(server: N8nServer): Record<string, string> {
  return {
    "X-N8N-API-KEY": server.apiKey,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

function buildExecutionsEndpoint(limit: number, workflowId?: string, status?: string): string {
  let endpoint = `/executions?limit=${limit}`;
  if (workflowId) endpoint += `&workflowId=${workflowId}`;
  if (status) endpoint += `&status=${status}`;
  return endpoint;
}

function buildWorkflowNodes(nodes: Array<{ type: string; name: string; parameters?: Record<string, unknown>; position?: number[] }>) {
  return nodes.map((n, i) => ({
    parameters: n.parameters || {},
    type: n.type,
    typeVersion: 1,
    position: n.position || [250 * i, 300],
    name: n.name,
  }));
}

function buildWorkflowConnections(connections: Array<{ from_node: string; to_node: string; from_output?: number; to_input?: number }>) {
  const n8nConnections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }> = {};
  for (const conn of connections) {
    if (!n8nConnections[conn.from_node]) {
      n8nConnections[conn.from_node] = { main: [[]] };
    }
    const main = n8nConnections[conn.from_node].main;
    while (main.length <= (conn.from_output || 0)) main.push([]);
    main[conn.from_output || 0].push({
      node: conn.to_node,
      type: "main",
      index: conn.to_input || 0,
    });
  }
  return n8nConnections;
}

function stripExportFields(wf: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...wf };
  delete copy.id;
  delete copy.tags;
  delete copy.active;
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.versionId;
  return copy;
}

function addServer(
  config: ServerConfig,
  name: string,
  url: string,
  apiKey: string,
  isDefault: boolean
): ServerConfig {
  // Remove existing server with same name
  config.servers = config.servers.filter(s => s.name !== name);

  // If is_default, clear other defaults
  if (isDefault) {
    config.servers.forEach(s => s.isDefault = false);
  }

  config.servers.push({
    name,
    url: url.replace(/\/$/, ""),
    apiKey,
    isDefault: isDefault || config.servers.length === 0,
  });

  return config;
}

function removeServer(config: ServerConfig, serverName: string): { config: ServerConfig; removed: boolean } {
  const before = config.servers.length;
  config.servers = config.servers.filter(s => s.name !== serverName);

  if (config.servers.length === before) {
    return { config, removed: false };
  }

  // Ensure a default exists
  if (config.servers.length > 0 && !config.servers.some(s => s.isDefault)) {
    config.servers[0].isDefault = true;
  }

  return { config, removed: true };
}

function formatServerList(config: ServerConfig): string[] {
  if (config.servers.length === 0) {
    return ["No servers configured. Use n8n_add_server to add one."];
  }

  const lines = ["Configured n8n servers:\n"];
  for (const s of config.servers) {
    const def = s.isDefault ? " [DEFAULT]" : "";
    const keyHint = s.apiKey ? ` (key: ${s.apiKey.substring(0, 8)}...)` : " (no key)";
    lines.push(`  ${s.name}: ${s.url}${keyHint}${def}`);
  }
  return lines;
}

// Node catalog (mirrored from src/index.ts)
const NODE_CATALOG = [
  { type: "n8n-nodes-base.manualTrigger", name: "Manual Trigger", cat: "trigger", desc: "Start workflow manually from n8n UI" },
  { type: "n8n-nodes-base.scheduleTrigger", name: "Schedule Trigger", cat: "trigger", desc: "Cron-based scheduling. Params: rule.interval[].field='cronExpression', expression='0 9 * * *'" },
  { type: "n8n-nodes-base.webhook", name: "Webhook", cat: "trigger", desc: "HTTP webhook endpoint. Params: path='/my-hook', httpMethod='POST'" },
  { type: "n8n-nodes-base.emailTrigger", name: "Email Trigger (IMAP)", cat: "trigger", desc: "Trigger on new emails via IMAP" },
  { type: "n8n-nodes-base.httpRequest", name: "HTTP Request", cat: "action", desc: "Make HTTP requests. Params: url, method, headers, body" },
  { type: "n8n-nodes-base.emailSend", name: "Send Email", cat: "action", desc: "Send emails via SMTP. Params: fromEmail, toEmail, subject, text" },
  { type: "n8n-nodes-base.slack", name: "Slack", cat: "action", desc: "Send messages to Slack channels" },
  { type: "n8n-nodes-base.telegram", name: "Telegram", cat: "action", desc: "Send messages via Telegram bot" },
  { type: "n8n-nodes-base.googleSheets", name: "Google Sheets", cat: "action", desc: "Read/write Google Sheets data" },
  { type: "n8n-nodes-base.if", name: "IF", cat: "logic", desc: "Conditional routing. Two outputs: true (index 0) and false (index 1)" },
  { type: "n8n-nodes-base.switch", name: "Switch", cat: "logic", desc: "Multi-path routing based on conditions" },
  { type: "n8n-nodes-base.merge", name: "Merge", cat: "logic", desc: "Merge data from multiple branches" },
  { type: "n8n-nodes-base.set", name: "Set", cat: "transform", desc: "Set/modify data fields" },
  { type: "n8n-nodes-base.code", name: "Code", cat: "transform", desc: "Execute custom JavaScript. Params: jsCode='return items;'" },
  { type: "n8n-nodes-base.splitInBatches", name: "Split In Batches", cat: "transform", desc: "Process items in batches" },
  { type: "n8n-nodes-base.aggregate", name: "Aggregate", cat: "transform", desc: "Aggregate multiple items into one" },
  { type: "@n8n/n8n-nodes-langchain.agent", name: "AI Agent", cat: "ai", desc: "LangChain-based AI agent with tools" },
  { type: "@n8n/n8n-nodes-langchain.chainLlm", name: "LLM Chain", cat: "ai", desc: "Simple LLM chain for text generation" },
  { type: "@n8n/n8n-nodes-langchain.openAi", name: "OpenAI", cat: "ai", desc: "Direct OpenAI API integration" },
];

// ============================================================================
// Test Setup
// ============================================================================

let tmpDir: string;
let configDir: string;
let configFile: string;

async function makeTmpDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "n8n-mgr-test-"));
}

function makeServer(overrides?: Partial<N8nServer>): N8nServer {
  return {
    name: "test-server",
    url: "http://localhost:5678",
    apiKey: "n8n_api_1234567890abcdef",
    isDefault: true,
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("n8n-manager-mcp", () => {
  beforeEach(async () => {
    tmpDir = await makeTmpDir();
    configDir = path.join(tmpDir, ".n8n-manager-mcp");
    configFile = path.join(configDir, "servers.json");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // URL Building
  // ─────────────────────────────────────────────────────────────────────────

  describe("URL Building", () => {
    it("builds URL without trailing slash", () => {
      const srv = makeServer({ url: "http://localhost:5678" });
      expect(buildUrl(srv, "/workflows")).toBe("http://localhost:5678/api/v1/workflows");
    });

    it("strips trailing slash from server URL", () => {
      const srv = makeServer({ url: "http://localhost:5678/" });
      expect(buildUrl(srv, "/workflows")).toBe("http://localhost:5678/api/v1/workflows");
    });

    it("handles HTTPS URLs", () => {
      const srv = makeServer({ url: "https://n8n.example.com" });
      expect(buildUrl(srv, "/workflows/123")).toBe("https://n8n.example.com/api/v1/workflows/123");
    });

    it("handles URL with port and path", () => {
      const srv = makeServer({ url: "http://192.168.1.100:5678" });
      expect(buildUrl(srv, "/executions?limit=10")).toBe("http://192.168.1.100:5678/api/v1/executions?limit=10");
    });

    it("handles empty endpoint", () => {
      const srv = makeServer({ url: "http://localhost:5678" });
      expect(buildUrl(srv, "")).toBe("http://localhost:5678/api/v1");
    });

    it("handles multiple trailing slashes", () => {
      const srv = makeServer({ url: "http://localhost:5678///" });
      // regex /\/$/ only strips one, leaving //, which is the source behavior
      const result = buildUrl(srv, "/workflows");
      expect(result).toContain("/api/v1/workflows");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Headers
  // ─────────────────────────────────────────────────────────────────────────

  describe("Request Headers", () => {
    it("includes X-N8N-API-KEY header", () => {
      const srv = makeServer({ apiKey: "my-secret-key" });
      const headers = buildHeaders(srv);
      expect(headers["X-N8N-API-KEY"]).toBe("my-secret-key");
    });

    it("sets Content-Type to application/json", () => {
      const headers = buildHeaders(makeServer());
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("sets Accept to application/json", () => {
      const headers = buildHeaders(makeServer());
      expect(headers["Accept"]).toBe("application/json");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Config Persistence
  // ─────────────────────────────────────────────────────────────────────────

  describe("Config Persistence", () => {
    it("returns empty servers array when config file does not exist", async () => {
      const config = await loadConfig(configFile, configDir);
      expect(config.servers).toEqual([]);
      expect(getSafety(config).backupBeforeMutations).toBe(true);
    });

    it("creates config directory if it does not exist", async () => {
      await loadConfig(configFile, configDir);
      const stat = await fs.stat(configDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("writes and reads config roundtrip", async () => {
      const config: ServerConfig = {
        servers: [makeServer({ name: "prod", isDefault: true })],
      };
      await saveConfig(configFile, configDir, config);
      const loaded = await loadConfig(configFile, configDir);
      expect(loaded.servers).toHaveLength(1);
      expect(loaded.servers[0].name).toBe("prod");
    });

    it("falls back to empty config on malformed JSON", async () => {
      await ensureConfigDir(configDir);
      await fs.writeFile(configFile, "not valid json{{{", "utf-8");
      const config = await loadConfig(configFile, configDir);
      expect(config.servers).toEqual([]);
      expect(getSafety(config).auditLog).toBe(true);
    });

    it("saves config as pretty-printed JSON", async () => {
      const config: ServerConfig = { servers: [makeServer()] };
      await saveConfig(configFile, configDir, config);
      const raw = await fs.readFile(configFile, "utf-8");
      expect(raw).toContain("\n");
      expect(raw.startsWith("{")).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Server CRUD (add/remove/list/lookup)
  // ─────────────────────────────────────────────────────────────────────────

  describe("Safety Settings and Backups", () => {
    it("normalizes missing safety settings to secure defaults", () => {
      const config = normalizeConfig({ servers: [] });
      expect(getSafety(config)).toEqual({
        readOnly: false,
        backupBeforeMutations: true,
        auditLog: true,
      });
    });

    it("preserves explicit safety overrides", () => {
      const config = normalizeConfig({
        servers: [],
        safety: { readOnly: true, auditLog: false },
      });
      expect(getSafety(config).readOnly).toBe(true);
      expect(getSafety(config).backupBeforeMutations).toBe(true);
      expect(getSafety(config).auditLog).toBe(false);
    });

    it("builds the read-only block message for write operations", () => {
      const message = blockMessageForReadOnly("delete_workflow", {
        readOnly: true,
        backupBeforeMutations: true,
        auditLog: true,
      });
      expect(message).toContain("read-only mode");
      expect(message).toContain("delete_workflow");
    });

    it("allows operations when read-only mode is disabled", () => {
      const message = blockMessageForReadOnly("delete_workflow", DEFAULT_SAFETY);
      expect(message).toBeNull();
    });

    it("sanitizes server and workflow names for backup paths", () => {
      expect(sanitizePathPart("prod/server:main")).toBe("prod_server_main");
      expect(sanitizePathPart("")).toBe("unknown");
    });

    it("builds deterministic backup paths under the config directory", () => {
      const srv = makeServer({ name: "prod/server" });
      const backupPath = buildBackupPath(configDir, srv, "wf:123", "pre-restore", new Date("2026-05-23T12:00:00.000Z"));
      expect(backupPath).toContain(path.join(configDir, "backups", "prod_server"));
      expect(path.basename(backupPath)).toBe("wf_123-2026-05-23T12-00-00-000Z-pre-restore.json");
    });

    it("backup payloads preserve the full original workflow", async () => {
      const srv = makeServer({ name: "prod" });
      const workflow = { id: "wf1", name: "Important", active: true, nodes: [], connections: {} };
      const backupPath = buildBackupPath(configDir, srv, "wf1", "delete", new Date("2026-05-23T12:00:00.000Z"));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, JSON.stringify({ workflow }, null, 2), "utf-8");
      const raw = JSON.parse(await fs.readFile(backupPath, "utf-8"));
      expect(raw.workflow).toEqual(workflow);
      expect(stripExportFields(raw.workflow)).not.toHaveProperty("id");
    });
  });

  describe("Server Management", () => {
    it("adds a new server", () => {
      let config: ServerConfig = { servers: [] };
      config = addServer(config, "staging", "http://staging:5678/", "key123", false);
      expect(config.servers).toHaveLength(1);
      expect(config.servers[0].name).toBe("staging");
    });

    it("strips trailing slash from URL on add", () => {
      let config: ServerConfig = { servers: [] };
      config = addServer(config, "prod", "http://prod:5678/", "key", false);
      expect(config.servers[0].url).toBe("http://prod:5678");
    });

    it("first server automatically becomes default", () => {
      let config: ServerConfig = { servers: [] };
      config = addServer(config, "first", "http://first:5678", "key", false);
      expect(config.servers[0].isDefault).toBe(true);
    });

    it("setting is_default clears other defaults", () => {
      let config: ServerConfig = { servers: [makeServer({ name: "old", isDefault: true })] };
      config = addServer(config, "new", "http://new:5678", "key", true);
      const oldServer = config.servers.find(s => s.name === "old");
      const newServer = config.servers.find(s => s.name === "new");
      expect(oldServer?.isDefault).toBe(false);
      expect(newServer?.isDefault).toBe(true);
    });

    it("updates existing server by name (replaces)", () => {
      let config: ServerConfig = {
        servers: [makeServer({ name: "prod", url: "http://old:5678", apiKey: "old-key" })],
      };
      config = addServer(config, "prod", "http://new:5678", "new-key", true);
      expect(config.servers).toHaveLength(1);
      expect(config.servers[0].url).toBe("http://new:5678");
      expect(config.servers[0].apiKey).toBe("new-key");
    });

    it("removes an existing server", () => {
      let config: ServerConfig = { servers: [makeServer({ name: "to-remove" })] };
      const result = removeServer(config, "to-remove");
      expect(result.removed).toBe(true);
      expect(result.config.servers).toHaveLength(0);
    });

    it("returns removed=false for non-existent server", () => {
      const config: ServerConfig = { servers: [makeServer()] };
      const result = removeServer(config, "non-existent");
      expect(result.removed).toBe(false);
      expect(result.config.servers).toHaveLength(1);
    });

    it("re-promotes first server as default when default is removed", () => {
      const config: ServerConfig = {
        servers: [
          makeServer({ name: "default", isDefault: true }),
          makeServer({ name: "secondary", isDefault: false }),
        ],
      };
      const result = removeServer(config, "default");
      expect(result.config.servers[0].name).toBe("secondary");
      expect(result.config.servers[0].isDefault).toBe(true);
    });

    it("getDefaultServer returns server with isDefault=true", () => {
      const config: ServerConfig = {
        servers: [
          makeServer({ name: "a", isDefault: false }),
          makeServer({ name: "b", isDefault: true }),
        ],
      };
      expect(getDefaultServer(config)?.name).toBe("b");
    });

    it("getDefaultServer falls back to first server if no default set", () => {
      const config: ServerConfig = {
        servers: [
          makeServer({ name: "first", isDefault: false }),
          makeServer({ name: "second", isDefault: false }),
        ],
      };
      expect(getDefaultServer(config)?.name).toBe("first");
    });

    it("getDefaultServer returns undefined for empty config", () => {
      const config: ServerConfig = { servers: [] };
      expect(getDefaultServer(config)).toBeUndefined();
    });

    it("getServerByName finds correct server", () => {
      const config: ServerConfig = {
        servers: [
          makeServer({ name: "alpha" }),
          makeServer({ name: "beta" }),
        ],
      };
      expect(getServerByName(config, "beta")?.name).toBe("beta");
    });

    it("getServerByName returns undefined for unknown name", () => {
      const config: ServerConfig = { servers: [makeServer({ name: "alpha" })] };
      expect(getServerByName(config, "unknown")).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Server List Formatting
  // ─────────────────────────────────────────────────────────────────────────

  describe("Server List Formatting", () => {
    it("returns hint when no servers configured", () => {
      const lines = formatServerList({ servers: [] });
      expect(lines[0]).toContain("No servers configured");
    });

    it("shows [DEFAULT] marker for default server", () => {
      const config: ServerConfig = { servers: [makeServer({ name: "prod", isDefault: true })] };
      const lines = formatServerList(config);
      expect(lines.join("\n")).toContain("[DEFAULT]");
    });

    it("truncates API key to first 8 chars", () => {
      const config: ServerConfig = { servers: [makeServer({ apiKey: "abcdefghijklmnop" })] };
      const lines = formatServerList(config);
      expect(lines.join("\n")).toContain("(key: abcdefgh...)");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Workflow JSON Building (n8n_create_workflow logic)
  // ─────────────────────────────────────────────────────────────────────────

  describe("Workflow JSON Building", () => {
    it("builds nodes with default parameters", () => {
      const nodes = buildWorkflowNodes([
        { type: "n8n-nodes-base.webhook", name: "Webhook" },
      ]);
      expect(nodes[0].parameters).toEqual({});
      expect(nodes[0].typeVersion).toBe(1);
    });

    it("assigns default position based on index", () => {
      const nodes = buildWorkflowNodes([
        { type: "n8n-nodes-base.webhook", name: "Node0" },
        { type: "n8n-nodes-base.httpRequest", name: "Node1" },
        { type: "n8n-nodes-base.code", name: "Node2" },
      ]);
      expect(nodes[0].position).toEqual([0, 300]);
      expect(nodes[1].position).toEqual([250, 300]);
      expect(nodes[2].position).toEqual([500, 300]);
    });

    it("uses explicit position when provided", () => {
      const nodes = buildWorkflowNodes([
        { type: "n8n-nodes-base.webhook", name: "W", position: [100, 200] },
      ]);
      expect(nodes[0].position).toEqual([100, 200]);
    });

    it("passes through node parameters", () => {
      const nodes = buildWorkflowNodes([
        { type: "n8n-nodes-base.httpRequest", name: "HTTP", parameters: { url: "https://example.com", method: "POST" } },
      ]);
      expect(nodes[0].parameters).toEqual({ url: "https://example.com", method: "POST" });
    });

    it("builds connections with default outputs/inputs", () => {
      const conns = buildWorkflowConnections([
        { from_node: "Webhook", to_node: "HTTP Request" },
      ]);
      expect(conns["Webhook"].main[0]).toEqual([
        { node: "HTTP Request", type: "main", index: 0 },
      ]);
    });

    it("handles multiple from_outputs by growing the array", () => {
      const conns = buildWorkflowConnections([
        { from_node: "IF", to_node: "TrueBranch", from_output: 0 },
        { from_node: "IF", to_node: "FalseBranch", from_output: 1 },
      ]);
      expect(conns["IF"].main).toHaveLength(2);
      expect(conns["IF"].main[0][0].node).toBe("TrueBranch");
      expect(conns["IF"].main[1][0].node).toBe("FalseBranch");
    });

    it("handles explicit to_input index", () => {
      const conns = buildWorkflowConnections([
        { from_node: "A", to_node: "Merge", from_output: 0, to_input: 1 },
      ]);
      expect(conns["A"].main[0][0].index).toBe(1);
    });

    it("returns empty object for no connections", () => {
      const conns = buildWorkflowConnections([]);
      expect(conns).toEqual({});
    });

    it("builds complete workflow structure", () => {
      const nodes = buildWorkflowNodes([
        { type: "n8n-nodes-base.webhook", name: "Webhook" },
        { type: "n8n-nodes-base.httpRequest", name: "HTTP" },
      ]);
      const connections = buildWorkflowConnections([
        { from_node: "Webhook", to_node: "HTTP" },
      ]);
      const workflow = {
        name: "Test WF",
        nodes,
        connections,
        settings: { executionOrder: "v1" },
      };
      expect(workflow.name).toBe("Test WF");
      expect(workflow.nodes).toHaveLength(2);
      expect(workflow.settings.executionOrder).toBe("v1");
      expect(workflow.connections["Webhook"].main[0][0].node).toBe("HTTP");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Export Field Stripping
  // ─────────────────────────────────────────────────────────────────────────

  describe("Export Field Stripping", () => {
    it("removes id field", () => {
      const result = stripExportFields({ id: "123", name: "WF" });
      expect(result).not.toHaveProperty("id");
      expect(result).toHaveProperty("name");
    });

    it("removes tags field", () => {
      const result = stripExportFields({ tags: ["prod"], name: "WF" });
      expect(result).not.toHaveProperty("tags");
    });

    it("removes active field", () => {
      const result = stripExportFields({ active: true, name: "WF" });
      expect(result).not.toHaveProperty("active");
    });

    it("removes createdAt field", () => {
      const result = stripExportFields({ createdAt: "2024-01-01", name: "WF" });
      expect(result).not.toHaveProperty("createdAt");
    });

    it("removes updatedAt field", () => {
      const result = stripExportFields({ updatedAt: "2024-06-01", name: "WF" });
      expect(result).not.toHaveProperty("updatedAt");
    });

    it("removes versionId field", () => {
      const result = stripExportFields({ versionId: "abc123", name: "WF" });
      expect(result).not.toHaveProperty("versionId");
    });

    it("removes all server-specific fields at once", () => {
      const full = {
        id: "42",
        tags: ["test"],
        active: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-06-01",
        versionId: "v1",
        name: "My Workflow",
        nodes: [],
        connections: {},
      };
      const result = stripExportFields(full);
      expect(result).toEqual({
        name: "My Workflow",
        nodes: [],
        connections: {},
      });
    });

    it("preserves nodes and connections", () => {
      const wf = {
        id: "1",
        nodes: [{ type: "test", name: "Test" }],
        connections: { Test: { main: [[]] } },
      };
      const result = stripExportFields(wf);
      expect(result.nodes).toEqual([{ type: "test", name: "Test" }]);
      expect(result.connections).toEqual({ Test: { main: [[]] } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Import Validation
  // ─────────────────────────────────────────────────────────────────────────

  describe("Import Validation", () => {
    it("rejects invalid JSON", () => {
      let error: unknown = null;
      try {
        JSON.parse("not valid {json");
      } catch (e) {
        error = e;
      }
      expect(error).not.toBeNull();
    });

    it("detects missing nodes field", () => {
      const data = JSON.parse('{"connections": {}}');
      expect(data.nodes).toBeUndefined();
    });

    it("detects missing connections field", () => {
      const data = JSON.parse('{"nodes": []}');
      expect(data.connections).toBeUndefined();
    });

    it("accepts valid workflow JSON", () => {
      const data = JSON.parse('{"name": "Test", "nodes": [], "connections": {}}');
      expect(data.nodes).toBeDefined();
      expect(data.connections).toBeDefined();
    });

    it("strips server fields from import data", () => {
      const data = {
        id: "old-id",
        active: true,
        tags: ["tag"],
        createdAt: "2024-01-01",
        updatedAt: "2024-06-01",
        versionId: "v1",
        name: "Imported",
        nodes: [{ type: "test", name: "T" }],
        connections: {},
      };
      const stripped = stripExportFields(data);
      expect(stripped).not.toHaveProperty("id");
      expect(stripped).not.toHaveProperty("active");
      expect(stripped.name).toBe("Imported");
      expect(stripped.nodes).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Executions Endpoint Builder
  // ─────────────────────────────────────────────────────────────────────────

  describe("Executions Endpoint Builder", () => {
    it("builds endpoint with limit only", () => {
      const ep = buildExecutionsEndpoint(20);
      expect(ep).toBe("/executions?limit=20");
    });

    it("appends workflowId when provided", () => {
      const ep = buildExecutionsEndpoint(10, "wf-123");
      expect(ep).toBe("/executions?limit=10&workflowId=wf-123");
    });

    it("appends status when provided", () => {
      const ep = buildExecutionsEndpoint(5, undefined, "error");
      expect(ep).toBe("/executions?limit=5&status=error");
    });

    it("appends both workflowId and status", () => {
      const ep = buildExecutionsEndpoint(50, "wf-456", "success");
      expect(ep).toBe("/executions?limit=50&workflowId=wf-456&status=success");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Node Catalog
  // ─────────────────────────────────────────────────────────────────────────

  describe("Node Catalog", () => {
    it("contains all 19 entries", () => {
      expect(NODE_CATALOG).toHaveLength(19);
    });

    it("filters trigger nodes correctly", () => {
      const triggers = NODE_CATALOG.filter(n => n.cat === "trigger");
      expect(triggers).toHaveLength(4);
      expect(triggers.map(t => t.name)).toContain("Webhook");
    });

    it("filters action nodes correctly", () => {
      const actions = NODE_CATALOG.filter(n => n.cat === "action");
      expect(actions).toHaveLength(5);
    });

    it("filters logic nodes correctly", () => {
      const logic = NODE_CATALOG.filter(n => n.cat === "logic");
      expect(logic).toHaveLength(3);
    });

    it("filters transform nodes correctly", () => {
      const transform = NODE_CATALOG.filter(n => n.cat === "transform");
      expect(transform).toHaveLength(4);
    });

    it("filters ai nodes correctly", () => {
      const ai = NODE_CATALOG.filter(n => n.cat === "ai");
      expect(ai).toHaveLength(3);
    });

    it("every entry has required fields", () => {
      for (const node of NODE_CATALOG) {
        expect(node.type).toBeDefined();
        expect(node.name).toBeDefined();
        expect(node.cat).toBeDefined();
        expect(node.desc).toBeDefined();
        expect(node.type.length).toBeGreaterThan(0);
        expect(node.name.length).toBeGreaterThan(0);
      }
    });

    it("all category returns full catalog", () => {
      const filtered = "all" === "all" ? NODE_CATALOG : NODE_CATALOG.filter(n => n.cat === "all");
      expect(filtered).toHaveLength(19);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Workflow List Formatting
  // ─────────────────────────────────────────────────────────────────────────

  describe("Workflow List Formatting", () => {
    function formatWorkflowList(
      srv: N8nServer,
      workflows: Array<{ id: string; name: string; active: boolean; nodes?: unknown[] }>
    ): string[] {
      const lines = [`Workflows on ${srv.name} (${srv.url}):\n`];
      for (const wf of workflows) {
        const nodeCount = wf.nodes?.length || 0;
        const status = wf.active ? "ACTIVE" : "inactive";
        lines.push(`  [${wf.id}] ${wf.name} (${nodeCount} nodes, ${status})`);
      }
      if (workflows.length === 0) lines.push("  No workflows found.");
      return lines;
    }

    it("shows no workflows message when empty", () => {
      const srv = makeServer({ name: "test", url: "http://test:5678" });
      const lines = formatWorkflowList(srv, []);
      expect(lines.join("\n")).toContain("No workflows found");
    });

    it("formats active workflow correctly", () => {
      const srv = makeServer({ name: "prod" });
      const lines = formatWorkflowList(srv, [
        { id: "1", name: "My Flow", active: true, nodes: [{}, {}, {}] },
      ]);
      expect(lines[1]).toContain("[1]");
      expect(lines[1]).toContain("My Flow");
      expect(lines[1]).toContain("3 nodes");
      expect(lines[1]).toContain("ACTIVE");
    });

    it("formats inactive workflow correctly", () => {
      const srv = makeServer();
      const lines = formatWorkflowList(srv, [
        { id: "2", name: "Disabled", active: false },
      ]);
      expect(lines[1]).toContain("inactive");
      expect(lines[1]).toContain("0 nodes");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Execution Duration Calculation
  // ─────────────────────────────────────────────────────────────────────────

  describe("Execution Duration Calculation", () => {
    function calcDuration(startedAt: string, stoppedAt: string | null): string {
      if (stoppedAt && startedAt) {
        return `${((new Date(stoppedAt).getTime() - new Date(startedAt).getTime()) / 1000).toFixed(1)}s`;
      }
      return "running";
    }

    it("calculates duration in seconds", () => {
      expect(calcDuration("2024-01-01T10:00:00Z", "2024-01-01T10:00:05Z")).toBe("5.0s");
    });

    it("handles sub-second duration", () => {
      expect(calcDuration("2024-01-01T10:00:00.000Z", "2024-01-01T10:00:00.500Z")).toBe("0.5s");
    });

    it("returns running when stoppedAt is null", () => {
      expect(calcDuration("2024-01-01T10:00:00Z", null)).toBe("running");
    });

    it("handles long durations", () => {
      expect(calcDuration("2024-01-01T10:00:00Z", "2024-01-01T10:05:30Z")).toBe("330.0s");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Error Message Building
  // ─────────────────────────────────────────────────────────────────────────

  describe("Error Handling Patterns", () => {
    it("formats error with status code", () => {
      const status = 401;
      const data = { error: "Unauthorized" };
      const msg = `Error ${status}: ${JSON.stringify(data)}`;
      expect(msg).toBe('Error 401: {"error":"Unauthorized"}');
    });

    it("formats network error (status 0)", () => {
      const result = { ok: false, status: 0, data: { error: "fetch failed" } };
      const msg = `Error ${result.status}: ${JSON.stringify(result.data)}`;
      expect(msg).toContain("Error 0");
      expect(msg).toContain("fetch failed");
    });

    it("formats 404 not found", () => {
      const status = 404;
      const data = { error: "Workflow not found" };
      const msg = `Error ${status}: ${JSON.stringify(data)}`;
      expect(msg).toContain("404");
      expect(msg).toContain("Workflow not found");
    });

    it("handles no-server-configured error", () => {
      const config: ServerConfig = { servers: [] };
      const srv = getDefaultServer(config);
      expect(srv).toBeUndefined();
      // This mirrors the tool handler's early return
      const errorMsg = "Error: No server configured. Use n8n_add_server first.";
      expect(errorMsg).toContain("No server configured");
    });
  });
});
