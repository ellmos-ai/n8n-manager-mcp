#!/usr/bin/env node
/**
 * Manual MCP smoke test for the built n8n Manager server.
 *
 * This starts dist/index.js over stdio and talks to it through the official MCP
 * SDK client. It intentionally avoids tools that need real n8n credentials.
 */

import fs from "node:fs";
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

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverEntry],
  cwd: repoRoot,
  stderr: "pipe",
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

  console.log(`MCP smoke passed: ${toolNames.length} tools listed and n8n_describe_nodes responded.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  reportFailure(message, stderr);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
