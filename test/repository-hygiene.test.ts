import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function isIgnored(candidate: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", candidate], { cwd: repoRoot });
    return true;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 1) return false;
    throw error;
  }
}

describe("repository hygiene", () => {
  it("ignores local n8n config, credentials, backups, keys, and databases", () => {
    const ignored = [
      ".env",
      ".env.local",
      ".npmrc",
      ".pypirc",
      "servers.json",
      ".n8n-manager-mcp/servers.json",
      ".n8n-manager-mcp/backups/prod/workflow.json",
      "backups/prod/workflow.json",
      "audit.log",
      "prod.local.json",
      "prod.secret.json",
      "secrets.json",
      "credentials.json",
      "credential-prod.json",
      "token.json",
      "tokens.json",
      "n8n.token.json",
      "npm_recovery_codes.txt",
      "id_rsa",
      "id_ed25519",
      "id_ecdsa",
      "id_dsa",
      "private.key",
      "certificate.pem",
      "client.p12",
      "client.pfx",
      "server.crt",
      "server.cer",
      "workflow.db",
      "workflow.sqlite",
      "workflow.sqlite3",
    ];

    for (const candidate of ignored) {
      expect(isIgnored(candidate), `${candidate} should be ignored`).toBe(true);
    }
  });

  it("keeps public package metadata and examples trackable", () => {
    const trackable = [
      "server.json",
      "README.md",
      "README_de.md",
      "CHANGELOG.md",
      ".env.example",
      ".env.sample",
    ];

    for (const candidate of trackable) {
      expect(isIgnored(candidate), `${candidate} should remain trackable`).toBe(false);
    }
  });

  it("uses an explicit npm file allowlist instead of broad local config globs", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8")) as {
      files?: string[];
    };

    expect(packageJson.files).toEqual([
      "dist/",
      "LICENSE",
      "README.md",
      "README_de.md",
      "CHANGELOG.md",
      "server.json",
      "scripts/smoke-mcp.js",
    ]);
    expect(packageJson.files).not.toContain("config/");
    expect(packageJson.files).not.toContain("*.json");
  });
});
