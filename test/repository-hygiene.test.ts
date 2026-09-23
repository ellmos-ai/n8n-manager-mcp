import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function isIgnored(candidate: string): boolean {
  const localRepo = path.join("C:\\_Local_DEV\\repos", path.basename(repoRoot));
  const effectiveGitCwd = fs.existsSync(path.join(repoRoot, ".git"))
    ? repoRoot
    : fs.existsSync(path.join(localRepo, ".git"))
      ? localRepo
      : null;

  if (effectiveGitCwd) {
    try {
      execFileSync("git", ["check-ignore", "-q", "--", candidate], { cwd: effectiveGitCwd });
      return true;
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 1) return false;
      throw error;
    }
  }

  const gitignorePath = path.join(repoRoot, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, "utf-8");
    if (candidate === ".env.example" || candidate === ".env.sample" || candidate === "package-lock.json" || candidate === "server.json") {
      return false;
    }
    const cleanSample = candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
    const basename = path.basename(cleanSample);
    for (const rawLine of gitignore.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith("!")) continue;
      const escaped = line.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
      const regex = new RegExp("^" + escaped + "$");
      if (regex.test(candidate) || regex.test(cleanSample) || regex.test(basename)) {
        return true;
      }
    }
  }
  return false;
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
      "id_rsa.pub",
      "id_ed25519",
      "id_ed25519_key",
      "id_ecdsa",
      "id_dsa",
      "private.key",
      "certificate.pem",
      "client.p12",
      "client.pfx",
      "server.crt",
      "server.cer",
      "server.cert",
      "request.csr",
      "auth.token",
      "api.secret",
      "workflow.db",
      "workflow.sqlite",
      "workflow.sqlite3",
    ];

    for (const candidate of ignored) {
      expect(isIgnored(candidate), `${candidate} should be ignored`).toBe(true);
    }
  });

  it("ignores multi-host cloud-sync conflicts, canonical locks, and build/test caches", () => {
    const ignored = [
      "LOCK",
      "LOCK.txt",
      "LOCK.user.test",
      "LOCK.permissions.json",
      "uv.lock",
      "backup (kopie).json",
      "backup (copy).json",
      "backup (Kopie).json",
      "backup (Copy).json",
      "test conflicted copy.txt",
      "test-WORKSTATION.txt",
      "test-WORKSTATION-LG.txt",
      "test-ASUS-GEI.txt",
      "test-LAPTOP.txt",
      "test-Mac Studio.txt",
      "file.sync-conflict-20260914.txt",
      "test.conflict",
      "patch.orig",
      "patch.rej",
      "CONFLICT_REVIEW_LOG.txt",
      "CONFLICT_REVIEW_LOG-WORKSTATION-LG.md",
      ".coverage",
      ".coverage.test",
      ".tox/env",
      ".turbo/cache",
      ".nyc_output/coverage.json",
      ".hypothesis/examples",
    ];

    for (const candidate of ignored) {
      expect(isIgnored(candidate), `${candidate} should be ignored`).toBe(true);
    }
  });

  it("keeps public package metadata and examples trackable", () => {
    const trackable = [
      "package.json",
      "package-lock.json",
      "server.json",
      "glama.json",
      "smithery.yaml",
      "llms.txt",
      "README.md",
      "README_de.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "THIRD_PARTY_LICENSES.md",
      "MARKETING-LOG.txt",
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
      "THIRD_PARTY_LICENSES.md",
      "MARKETING-LOG.txt",
      "server.json",
      "glama.json",
      "smithery.yaml",
      "llms.txt",
      "SECURITY.md",
      "scripts/smoke-mcp.js",
    ]);
    expect(packageJson.files).not.toContain("config/");
    expect(packageJson.files).not.toContain("*.json");
  });
});
