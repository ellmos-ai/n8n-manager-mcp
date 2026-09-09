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

    expect(pkg.version).toBe("0.1.17");
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
      ".gitignore",
    ];

    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(repoRoot, file)), `Missing required file: ${file}`).toBe(true);
    }
  });

  it("validates GitHub Actions CI workflow structure and step matrix", () => {
    const ciWorkflowPath = path.join(repoRoot, ".github", "workflows", "tests.yml");
    expect(fs.existsSync(ciWorkflowPath)).toBe(true);
    const ciWorkflow = fs.readFileSync(ciWorkflowPath, "utf-8");

    expect(ciWorkflow).toContain("uses: actions/checkout@v4");
    expect(ciWorkflow).toContain("uses: actions/setup-node@v4");
    expect(ciWorkflow).toContain("node-version: [20, 22]");
    expect(ciWorkflow).toContain("run: npm ci");
    expect(ciWorkflow).toContain("run: npm run build");
    expect(ciWorkflow).toContain("run: npm test");
    expect(ciWorkflow).toContain("run: npm run smoke");
    expect(ciWorkflow).toContain("run: npm pack --dry-run --json");
    expect(ciWorkflow).toContain("concurrency:");
    expect(ciWorkflow).toContain("cancel-in-progress: true");
  });

  it("verifies bilingual security policy, SLAs, supported versions, and direct contact points", () => {
    const secPath = path.join(repoRoot, "SECURITY.md");
    expect(fs.existsSync(secPath)).toBe(true);
    const secContent = fs.readFileSync(secPath, "utf-8");

    expect(secContent).toContain("## Deutsch");
    expect(secContent).toContain("## English");
    expect(secContent).toContain("`0.1.x`");
    expect(secContent).toContain("48 Stunden");
    expect(secContent).toContain("48 hours");
    expect(secContent).toContain("security@open-bricks.org");
    expect(secContent).toContain("security@ellmos.ai");
    expect(secContent).toContain("support@lukasgeiger.com");
    expect(secContent).toContain("lukas@open-bricks.org");
    expect(secContent).toContain("Local-First");
    expect(secContent).toContain("N8N_MANAGER_READ_ONLY=1");
    expect(secContent).toContain("~/.n8n-manager-mcp/backups/");
    expect(secContent).toContain("~/.n8n-manager-mcp/audit.log");
  });

  it("verifies quick navigation anchors and sections across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readme).toContain("## Quick Navigation");
    expect(readmeDe).toContain("## Schnellnavigation");
    expect(readme).toContain("#system-architecture");
    expect(readmeDe).toContain("#systemarchitektur");
    expect(readme).toContain("#core-capabilities--safety-invariants");
    expect(readmeDe).toContain("#kernfähigkeiten--sicherheitsinvarianten");
    expect(readme).toContain("#available-tools");
    expect(readmeDe).toContain("#verfügbare-tools");
    expect(readme).toContain("#ellmos-ai-ecosystem");
    expect(readmeDe).toContain("#ellmos-ai-ökosystem");
  });

  it("verifies core capabilities and safety invariants tables across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readme).toContain("## Core Capabilities & Safety Invariants");
    expect(readmeDe).toContain("## Kernfähigkeiten & Sicherheitsinvarianten");
    expect(readme).toContain("100% Local-First & Zero-Egress");
    expect(readmeDe).toContain("100% Local-First & Zero-Egress");
    expect(readme).toContain("Monotonic Read-Only Enforcement");
    expect(readmeDe).toContain("Monotones Read-Only-Schutzgating");
    expect(readme).toContain("Automated Pre-Mutation Backups");
    expect(readmeDe).toContain("Automatische Pre-Mutation-Backups");
    expect(readme).toContain("Local Audit Trail");
    expect(readmeDe).toContain("Lokale Audit-Protokollierung");
  });

  it("verifies sibling tools and ecosystem matrix across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    const siblingRepos = [
      "ProFiler",
      "ExplorerPro",
      "WinStorePackager",
      "DokuZen",
      "PDFtoPDFocr",
      "USR_PDFunlock",
      "UniversalInvoiceMail",
      "CleanMarkdown",
      "safe-start-for-codex",
      "automation-master",
      "DevCenter",
      "CodeBox",
      "githubbot",
      "swarm-ai",
      "ellmos-core",
      "open-bricks",
    ];

    for (const repo of siblingRepos) {
      expect(readme).toContain(repo);
      expect(readmeDe).toContain(repo);
    }
  });

  it("verifies .gitignore patterns for sync conflicts, locks, and test caches", () => {
    const gitignore = fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf-8");

    expect(gitignore).toContain("*.sync-conflict-*");
    expect(gitignore).toContain("*.conflict");
    expect(gitignore).toContain("*-CONFLIT-*");
    expect(gitignore).toContain("*-conflict-*");
    expect(gitignore).toContain("*.sync-temp-*");
    expect(gitignore).toContain("LOCK.*");
    expect(gitignore).toContain("*.lock");
    expect(gitignore).toContain("LOCK*.txt");
    expect(gitignore).toContain("!package-lock.json");
    expect(gitignore).toContain(".coverage");
    expect(gitignore).toContain("coverage/");
    expect(gitignore).toContain(".pytest_cache/");
    expect(gitignore).toContain(".ruff_cache/");
    expect(gitignore).toContain(".wheel-smoke/");
    expect(gitignore).toContain("wheelhouse/");
    expect(gitignore).toContain("*.tmp");
    expect(gitignore).toContain("*.bak");
  });

  it("verifies repository hygiene preserves package-lock.json while ignoring multi-agent locks and sync conflict copies", () => {
    const gitignore = fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf-8");

    expect(gitignore).toMatch(/!\s*package-lock\.json/);
    expect(gitignore).toMatch(/LOCK\.\*/);
    expect(gitignore).toMatch(/\*\.sync-conflict-\*/);
    expect(gitignore).toMatch(/\*-conflict-\*/);
  });

  it("validates package.json manifest fields and npm distribution files", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8")) as {
      mcpName: string;
      type: string;
      main: string;
      files: string[];
    };

    expect(pkg.mcpName).toBe("io.github.ellmos-ai/n8n-manager-mcp");
    expect(pkg.type).toBe("module");
    expect(pkg.main).toBe("dist/index.js");
    expect(pkg.files).toContain("dist/");
    expect(pkg.files).toContain("SECURITY.md");
    expect(pkg.files).toContain("llms.txt");
  });

  it("verifies llms.txt timestamp, security reference, and tool inventory", () => {
    const llmsTxt = fs.readFileSync(path.join(repoRoot, "llms.txt"), "utf-8");

    expect(llmsTxt).toContain("Last-checked: 2026-09-09");
    expect(llmsTxt).toContain("SECURITY.md");
    expect(llmsTxt).toContain("io.github.ellmos-ai/n8n-manager-mcp");
    expect(llmsTxt).toContain("19 tools covering complete n8n workflow management");
  });

  it("verifies documentation badge synchronization and links across languages", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readme).toContain("180%20passed");
    expect(readmeDe).toContain("180%20passed");
    expect(readme).toContain("README_de.md");
    expect(readmeDe).toContain("README.md");
    expect(readme).toContain("https://github.com/open-bricks");
    expect(readmeDe).toContain("https://github.com/open-bricks");
    expect(readme).toContain("https://github.com/ellmos-ai");
    expect(readmeDe).toContain("https://github.com/ellmos-ai");
  });
});
