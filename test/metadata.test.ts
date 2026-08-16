import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("metadata and manifest parity", () => {
  it("maintains consistent version across package.json, server.json, glama.json, and src/index.ts", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8")) as { version: string };
    const serverJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "server.json"), "utf-8")) as {
      version: string;
      packages?: Array<{ version: string }>;
    };
    const glamaJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "glama.json"), "utf-8")) as { version: string };
    const srcIndex = fs.readFileSync(path.join(repoRoot, "src", "index.ts"), "utf-8");

    expect(pkg.version).toBe("0.1.15");
    expect(serverJson.version).toBe(pkg.version);
    expect(serverJson.packages?.[0]?.version).toBe(pkg.version);
    expect(glamaJson.version).toBe(pkg.version);
    expect(srcIndex).toContain(`version: "${pkg.version}"`);
  });

  it("maintains consistent tool counts across documentation, glama.json, and smoke test", () => {
    const glamaJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "glama.json"), "utf-8")) as {
      tools?: { count: number };
    };
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");
    const llmsTxt = fs.readFileSync(path.join(repoRoot, "llms.txt"), "utf-8");
    const smokeScript = fs.readFileSync(path.join(repoRoot, "scripts", "smoke-mcp.js"), "utf-8");

    expect(glamaJson.tools?.count).toBe(19);
    expect(readme).toContain("19 Tools");
    expect(readmeDe).toContain("19 Tools");
    expect(llmsTxt).toContain("19 tools");
    expect(smokeScript).toContain("expectedTools = [");
    expect(smokeScript).toContain('"n8n_manager_history"');
  });

  it("verifies required project files and documentation exist", () => {
    const requiredFiles = [
      "package.json",
      "server.json",
      "glama.json",
      "smithery.yaml",
      "llms.txt",
      "README.md",
      "README_de.md",
      "CHANGELOG.md",
      "SECURITY.md",
      "LICENSE",
    ];

    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(repoRoot, file)), `Missing required file: ${file}`).toBe(true);
    }
  });
});
