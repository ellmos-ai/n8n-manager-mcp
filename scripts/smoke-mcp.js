#!/usr/bin/env node
/**
 * Manual MCP smoke test for the built n8n Manager server.
 *
 * This starts dist/index.js over stdio and talks to it through the official MCP
 * SDK client. It intentionally avoids tools that need real n8n credentials.
 */

import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const expectedTools = [
  "n8n_activate_workflow",
  "n8n_add_server",
  "n8n_create_workflow",
  "n8n_delete_workflow",
  "n8n_describe_nodes",
  "n8n_export_workflow",
  "n8n_get_workflow",
  "n8n_import_workflow",
  "n8n_list_backups",
  "n8n_list_executions",
  "n8n_list_servers",
  "n8n_list_workflows",
  "n8n_manager_history",
  "n8n_ping_server",
  "n8n_remove_server",
  "n8n_restore_workflow",
  "n8n_safety_status",
  "n8n_set_safety_mode",
  "n8n_update_workflow",
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const serverEntry = path.join(repoRoot, "dist", "index.js");
const sentinel = "SYNTHETIC_N8N_KEY_DO_NOT_USE_758255363";
const storedSentinel = "SYNTHETIC_STORED_KEY_758255363";

function reportFailure(message, stderr = "") {
  console.error(`MCP smoke failed: ${message}`);
  if (stderr.trim()) {
    console.error("\nServer stderr:");
    console.error(stderr.trim());
  }
}

if (!fs.existsSync(serverEntry)) {
  reportFailure("dist/index.js is missing. Run `npm run build` before `npm run smoke`.");
  process.exit(1);
}

const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "n8n-manager-smoke-"));
let targetHits = 0;
let sourceHits = 0;
let responseMode = "redirect";
let expectedKey = sentinel;
let activatedEchoId = false;
const targetServer = http.createServer((_request, response) => {
  targetHits++;
  response.writeHead(200, { "content-type": "application/json" });
  response.end("{}");
});
await new Promise(resolve => targetServer.listen(0, "127.0.0.1", resolve));
const targetUrl = `http://127.0.0.1:${targetServer.address().port}`;
const sourceServer = http.createServer((request, response) => {
  sourceHits++;
  if (request.headers["x-n8n-api-key"] !== expectedKey) {
    response.writeHead(400);
    response.end("missing synthetic key");
    return;
  }
  if (responseMode === "redirect") {
    response.writeHead(302, { location: targetUrl });
    response.end("redirect blocked");
  } else if (responseMode === "success-echo") {
    response.writeHead(200, { "content-type": "application/json" });
    if (request.method === "POST") {
      response.end(JSON.stringify({ id: sentinel, name: "created-on-stub" }));
    } else if (request.method === "PATCH") {
      activatedEchoId = request.url?.includes(sentinel) ?? false;
      response.end(JSON.stringify({ id: sentinel, active: true }));
    } else {
      response.end(JSON.stringify({ id: "wf", echoed_value: sentinel, [sentinel]: "object-key-echo" }));
    }
  } else {
    response.writeHead(401);
    response.end(`Übersicht: rejected header ${expectedKey}`);
  }
});
await new Promise(resolve => sourceServer.listen(0, "127.0.0.1", resolve));
const sourceUrl = `http://127.0.0.1:${sourceServer.address().port}`;

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverEntry],
  cwd: repoRoot,
  stderr: "pipe",
  env: {
    ...process.env,
    HOME: tempHome,
    USERPROFILE: tempHome,
    N8N_MANAGER_API_KEY: sentinel,
    N8N_MANAGER_SERVER_URL: sourceUrl,
  },
});

let stderr = "";
transport.stderr?.on("data", chunk => {
  stderr += chunk.toString();
});

const client = new Client({
  name: "n8n-manager-smoke",
  version: "0.1.0",
});

try {
  await client.connect(transport);

  const { tools } = await client.listTools();
  const toolNames = tools.map(tool => tool.name).sort();
  const missing = expectedTools.filter(name => !toolNames.includes(name));
  const unexpected = toolNames.filter(name => !expectedTools.includes(name));

  if (missing.length > 0 || unexpected.length > 0) {
    const parts = [];
    if (missing.length > 0) parts.push(`missing: ${missing.join(", ")}`);
    if (unexpected.length > 0) parts.push(`unexpected: ${unexpected.join(", ")}`);
    throw new Error(`tool list mismatch (${parts.join("; ")})`);
  }

  const addServer = tools.find(tool => tool.name === "n8n_add_server");
  if (Object.hasOwn(addServer?.inputSchema?.properties ?? {}, "api_key")) {
    throw new Error("n8n_add_server exposes api_key as an MCP tool argument");
  }

  const addResult = await client.callTool({
    name: "n8n_add_server",
    arguments: { name: "smoke", url: sourceUrl },
  });
  const addText = addResult.content?.map(part => part.type === "text" ? part.text : "").join("\n") ?? "";
  if (addResult.isError || !addText.includes('Server "smoke" added') || addText.includes(sentinel)) {
    throw new Error("n8n_add_server did not consume the host environment safely");
  }
  const configPath = path.join(tempHome, ".n8n-manager-mcp", "servers.json");
  const saved = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (saved.servers?.[0]?.apiKey !== sentinel) {
    throw new Error("n8n_add_server did not persist the host-provided key");
  }
  saved.servers[0].apiKey = storedSentinel;
  fs.writeFileSync(configPath, JSON.stringify(saved));
  const preserved = await client.callTool({
    name: "n8n_add_server",
    arguments: { name: "smoke", url: sourceUrl },
  });
  if (preserved.isError || JSON.parse(fs.readFileSync(configPath, "utf8")).servers[0].apiKey !== storedSentinel) {
    throw new Error("a host environment key silently replaced an existing server key");
  }
  const rotated = await client.callTool({
    name: "n8n_add_server",
    arguments: { name: "smoke", url: sourceUrl, rotate_key: true },
  });
  if (rotated.isError || JSON.parse(fs.readFileSync(configPath, "utf8")).servers[0].apiKey !== sentinel) {
    throw new Error("explicit key rotation did not use the host environment");
  }
  const changedUrl = await client.callTool({
    name: "n8n_add_server",
    arguments: { name: "smoke", url: "http://127.0.0.1:2" },
  });
  if (!JSON.stringify(changedUrl).includes("requires rotate_key=true")) {
    throw new Error("an existing key could be moved to a different URL without rotation");
  }
  const unpinned = await client.callTool({
    name: "n8n_add_server",
    arguments: { name: "other", url: "http://127.0.0.1:2" },
  });
  if (!JSON.stringify(unpinned).includes("must match N8N_MANAGER_SERVER_URL")) {
    throw new Error("the host key could be bound to a non-pinned URL");
  }
  const pingRedirect = await client.callTool({ name: "n8n_ping_server", arguments: {} });
  if (targetHits !== 0 || sourceHits !== 1 || !JSON.stringify(pingRedirect).includes("unreachable")) {
    throw new Error("an API-key request followed a redirect");
  }
  responseMode = "echo";
  const pingError = await client.callTool({ name: "n8n_ping_server", arguments: {} });
  const createError = await client.callTool({
    name: "n8n_create_workflow",
    arguments: { name: "local-error-probe", nodes: [] },
  });
  const audit = fs.readFileSync(path.join(tempHome, ".n8n-manager-mcp", "audit.log"), "utf8");
  if (sourceHits !== 3 || JSON.stringify(pingError).includes(sentinel) ||
      JSON.stringify(createError).includes(sentinel) || audit.includes(sentinel)) {
    throw new Error("an upstream error echoed the API key into a tool result or audit log");
  }
  responseMode = "success-echo";
  const workflowSuccess = await client.callTool({
    name: "n8n_get_workflow", arguments: { workflow_id: "wf" },
  });
  const createSuccess = await client.callTool({
    name: "n8n_create_workflow", arguments: { name: "local-success-probe", nodes: [], activate: true },
  });
  const successAudit = fs.readFileSync(path.join(tempHome, ".n8n-manager-mcp", "audit.log"), "utf8");
  if (!activatedEchoId || JSON.stringify(workflowSuccess).includes(sentinel) ||
      JSON.stringify(createSuccess).includes(sentinel) || successAudit.includes(sentinel) ||
      stderr.includes(sentinel)) {
    throw new Error("a successful response or structured audit leaked an API key");
  }
  const absentEnv = { ...process.env, HOME: tempHome, USERPROFILE: tempHome, N8N_MANAGER_SERVER_URL: sourceUrl };
  delete absentEnv.N8N_MANAGER_API_KEY;
  const absentTransport = new StdioClientTransport({
    command: process.execPath, args: [serverEntry], cwd: repoRoot, stderr: "pipe", env: absentEnv,
  });
  const absentClient = new Client({ name: "n8n-manager-missing-env-smoke", version: "0.1.0" });
  try {
    await absentClient.connect(absentTransport);
    const missingKey = await absentClient.callTool({
      name: "n8n_add_server", arguments: { name: "new-without-key", url: sourceUrl },
    });
    if (!JSON.stringify(missingKey).includes("API key is required")) {
      throw new Error("a new profile was accepted without a host key");
    }
    const legacyUpdate = await absentClient.callTool({
      name: "n8n_add_server", arguments: { name: "smoke", url: sourceUrl },
    });
    if (legacyUpdate.isError || JSON.parse(fs.readFileSync(configPath, "utf8")).servers[0].apiKey !== sentinel) {
      throw new Error("an existing profile did not keep its key with no environment key");
    }
  } finally {
    await absentClient.close().catch(() => {});
  }
  const withRemovableKey = JSON.parse(fs.readFileSync(configPath, "utf8"));
  withRemovableKey.servers.push({
    name: storedSentinel, url: sourceUrl, apiKey: storedSentinel, isDefault: false,
  });
  fs.writeFileSync(configPath, JSON.stringify(withRemovableKey));
  const removed = await client.callTool({
    name: "n8n_remove_server", arguments: { server_name: storedSentinel },
  });
  if (JSON.stringify(removed).includes(storedSentinel) ||
      JSON.parse(fs.readFileSync(configPath, "utf8")).servers.some(server => server.name === storedSentinel)) {
    throw new Error("a removed profile key escaped the outgoing result boundary");
  }
  const listResult = await client.callTool({ name: "n8n_list_servers", arguments: {} });
  if (JSON.stringify(listResult).includes(sentinel) || stderr.includes(sentinel)) {
    throw new Error("API key appeared in an MCP response or stderr");
  }

  const nodeResult = await client.callTool({
    name: "n8n_describe_nodes",
    arguments: { category: "trigger" },
  });
  const nodeText = nodeResult.content
    ?.map(part => part.type === "text" ? part.text : "")
    .join("\n") ?? "";

  if (!nodeText.includes("n8n-nodes-base.webhook")) {
    throw new Error("n8n_describe_nodes did not return the webhook trigger catalog entry.");
  }

  const invalidCalls = [
    ["n8n_list_workflows", { limit: 0 }],
    ["n8n_list_executions", { limit: 1.5 }],
    ["n8n_list_backups", { limit: 1001 }],
    ["n8n_create_workflow", {
      name: "invalid connection probe",
      nodes: [],
      connections: [{ from_node: "A", to_node: "B", from_output: -1 }],
    }],
  ];
  for (const [name, args] of invalidCalls) {
    const result = await client.callTool({ name, arguments: args });
    if (!result.isError) {
      throw new Error(`${name} accepted an invalid numeric argument`);
    }
  }

  console.log(`MCP smoke passed: ${toolNames.length} tools listed and n8n_describe_nodes responded.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  reportFailure(message, stderr);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
  await Promise.all([
    new Promise(resolve => sourceServer.close(resolve)),
    new Promise(resolve => targetServer.close(resolve)),
  ]);
  if (path.dirname(tempHome) === os.tmpdir() && path.basename(tempHome).startsWith("n8n-manager-smoke-")) {
    fs.rmSync(tempHome, { recursive: true, force: true });
  }
}
