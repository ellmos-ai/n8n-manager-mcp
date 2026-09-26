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

    expect(pkg.version).toBe("0.1.21");
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
      "THIRD_PARTY_LICENSES.md",
      "MARKETING-LOG.txt",
      "NOTICE",
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
    expect(ciWorkflow).toContain("timeout-minutes: 15");
    expect(ciWorkflow).toContain("run: npm ci");
    expect(ciWorkflow).toContain("run: npm run build");
    expect(ciWorkflow).toContain("run: npm test");
    expect(ciWorkflow).toContain("run: npm run smoke");
    expect(ciWorkflow).toContain("run: npm pack --dry-run --json");
    expect(ciWorkflow).toContain("concurrency:");
    expect(ciWorkflow).toContain("cancel-in-progress: true");
  });

  it("validates timeout guardrails and concurrency across all auxiliary workflows", () => {
    const staleWorkflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "stale.yml"), "utf-8");
    expect(staleWorkflow).toContain("timeout-minutes: 10");
    expect(staleWorkflow).toContain("concurrency:");
    expect(staleWorkflow).toContain("cancel-in-progress: true");

    const welcomeWorkflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "welcome.yml"), "utf-8");
    expect(welcomeWorkflow).toContain("timeout-minutes: 5");
    expect(welcomeWorkflow).toContain("concurrency:");
    expect(welcomeWorkflow).toContain("cancel-in-progress: true");

    const autoAssignWorkflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "auto-assign.yml"), "utf-8");
    expect(autoAssignWorkflow).toContain("timeout-minutes: 5");

    const labelSyncWorkflow = fs.readFileSync(path.join(repoRoot, ".github", "workflows", "label-sync.yml"), "utf-8");
    expect(labelSyncWorkflow).toContain("timeout-minutes: 5");
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
    expect(secContent).toContain("30 Tagen");
    expect(secContent).toContain("30 days");
    expect(secContent).toContain("Remediation SLA");
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
    expect(readme).toContain("#target-personas--discoverability");
    expect(readmeDe).toContain("#zielgruppen--auffindbarkeit");
    expect(readme).toContain("#comparative-matrix--alternatives");
    expect(readmeDe).toContain("#vergleichsmatrix--alternativen");
    expect(readme).toContain("#core-capabilities--safety-invariants");
    expect(readmeDe).toContain("#kernfähigkeiten--sicherheitsinvarianten");
    expect(readme).toContain("#available-tools");
    expect(readmeDe).toContain("#verfügbare-tools");
    expect(readme).toContain("#ellmos-ai-ecosystem");
    expect(readmeDe).toContain("#ellmos-ai-ökosystem");
    expect(readme).toContain("#third-party-licenses");
    expect(readmeDe).toContain("#drittanbieter-lizenzen");
    expect(readme).toContain("#third-party-licenses--transparency");
    expect(readmeDe).toContain("#drittanbieter-lizenzen--transparenz");
    expect(readme).toContain("#changelog");
    expect(readmeDe).toContain("#änderungsprotokoll");
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
    expect(gitignore).toContain("* (kopie)*");
    expect(gitignore).toContain("*-WORKSTATION-LG*");
    expect(gitignore).toContain("*-ASUS*");
    expect(gitignore).toContain("*-ASUS-GEI*");
    expect(gitignore).toContain("*-MacBook*");
    expect(gitignore).toContain("*-IDEAPAD*");
    expect(gitignore).toMatch(/^LOCK$/m);
    expect(gitignore).toContain("LOCK.*");
    expect(gitignore).toContain("*.lock");
    expect(gitignore).toContain("LOCK*.txt");
    expect(gitignore).toContain("LOCK.permissions.json");
    expect(gitignore).toContain(".automation-lock");
    expect(gitignore).toContain("uv.lock");
    expect(gitignore).toContain("!package-lock.json");
    expect(gitignore).toContain(".coverage");
    expect(gitignore).toContain(".coverage.*");
    expect(gitignore).toContain("coverage/");
    expect(gitignore).toContain(".pytest_cache/");
    expect(gitignore).toContain(".pytest_temp/");
    expect(gitignore).toContain(".ruff_cache/");
    expect(gitignore).toContain(".wheel-smoke/");
    expect(gitignore).toContain("wheelhouse/");
    expect(gitignore).toContain(".tox/");
    expect(gitignore).toContain(".turbo/");
    expect(gitignore).toContain("*.tmp");
    expect(gitignore).toContain("*.bak");
    expect(gitignore).toContain("*.orig");
    expect(gitignore).toContain("*.rej");
    expect(gitignore).toContain("*.token");
    expect(gitignore).toContain("*.secret");
    expect(gitignore).toContain("CONFLICT_REVIEW_LOG*");
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
    expect(pkg.files).toContain("NOTICE");
    expect(pkg.files).toContain("llms.txt");
    expect(pkg.files).toContain("THIRD_PARTY_LICENSES.md");
    expect(pkg.files).toContain("MARKETING-LOG.txt");
  });

  it("verifies llms.txt timestamp, security reference, and tool inventory", () => {
    const llmsTxt = fs.readFileSync(path.join(repoRoot, "llms.txt"), "utf-8");

    expect(llmsTxt).toContain("Last-checked: 2026-09-26");
    expect(llmsTxt).toContain("NOTICE");
    expect(llmsTxt).toContain("SECURITY.md");
    expect(llmsTxt).toContain("THIRD_PARTY_LICENSES.md");
    expect(llmsTxt).toContain("MARKETING-LOG.txt");
    expect(llmsTxt).toContain("io.github.ellmos-ai/n8n-manager-mcp");
    expect(llmsTxt).toContain("19 tools covering complete n8n workflow management");
  });

  it("verifies documentation badge synchronization and links across languages", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readme).toContain("194%20passed");
    expect(readmeDe).toContain("194%20passed");
    expect(readme).toContain("README_de.md");
    expect(readmeDe).toContain("README.md");
    expect(readme).toContain("https://github.com/open-bricks");
    expect(readmeDe).toContain("https://github.com/open-bricks");
    expect(readme).toContain("https://github.com/ellmos-ai");
    expect(readmeDe).toContain("https://github.com/ellmos-ai");
  });

  it("verifies canonical invariant IDs INV-LOCAL-01 through INV-SLA-10 across documentation", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");
    const marketingLog = fs.readFileSync(path.join(repoRoot, "MARKETING-LOG.txt"), "utf-8");

    const expectedInvariants = [
      "INV-LOCAL-01",
      "INV-READ-02",
      "INV-BACK-03",
      "INV-AUDIT-04",
      "INV-SRV-05",
      "INV-TRAV-06",
      "INV-PRIV-07",
      "INV-SEAM-08",
      "INV-NODE-09",
      "INV-SLA-10",
    ];

    for (const inv of expectedInvariants) {
      expect(readme, `README.md missing invariant ${inv}`).toContain(inv);
      expect(readmeDe, `README_de.md missing invariant ${inv}`).toContain(inv);
      expect(marketingLog, `MARKETING-LOG.txt missing invariant ${inv}`).toContain(inv);
    }
  });

  it("verifies Dual-Mermaid diagrams across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    for (const doc of [readme, readmeDe]) {
      expect(doc).toMatch(/(?:flowchart|graph)\s+TD/);
      expect(doc).toContain("sequenceDiagram");
      expect(doc).toContain("autonumber");
      expect(doc).toContain("INV-BACK-03");
      expect(doc).toContain("INV-READ-02");
    }
  });

  it("verifies THIRD_PARTY_LICENSES.md and MARKETING-LOG.txt content integrity", () => {
    const licenses = fs.readFileSync(path.join(repoRoot, "THIRD_PARTY_LICENSES.md"), "utf-8");
    const marketing = fs.readFileSync(path.join(repoRoot, "MARKETING-LOG.txt"), "utf-8");

    expect(licenses).toContain("@modelcontextprotocol/sdk");
    expect(licenses).toContain("zod");
    expect(licenses).toContain("update-notifier");
    expect(licenses).toContain("Apache-2.0");
    expect(licenses).toContain("BSD-2-Clause");
    expect(licenses).toContain("MIT");

    expect(marketing).toContain("[PERSONA-1]");
    expect(marketing).toContain("[PERSONA-2]");
    expect(marketing).toContain("[PERSONA-3]");
    expect(marketing).toContain("[PERSONA-4]");
    expect(marketing).toContain("THREE-PHASE DISCOVERABILITY ROADMAP");
    expect(marketing).toContain("3. HIGH-INTENT KEYWORD & DISCOVERY MATRIX");
    expect(marketing).toContain("4. 5-WAY COMPARATIVE MATRIX");
  });

  it("verifies target personas and comparative matrix tables across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readme).toContain("## Target Personas & Discoverability");
    expect(readmeDe).toContain("## Zielgruppen & Auffindbarkeit");
    expect(readme).toContain("Autonomous AI Agents & Swarms");
    expect(readmeDe).toContain("Autonome KI-Agenten & Schwärme");
    expect(readme).toContain("DevOps & Multi-Environment Engineers");
    expect(readmeDe).toContain("DevOps & Multi-Environment-Architekten");
    expect(readme).toContain("SecOps, Compliance & Risk Teams");
    expect(readmeDe).toContain("SecOps, Compliance & Risikoteams");
    expect(readme).toContain("Ecosystem Builders & Tool Integrators");
    expect(readmeDe).toContain("Ökosystem-Entwickler & Tool-Integratoren");

    expect(readme).toContain("## Comparative Matrix & Alternatives");
    expect(readmeDe).toContain("## Vergleichsmatrix & Alternativen");
    expect(readme).toContain("Direct n8n REST API");
    expect(readmeDe).toContain("Direkte n8n REST API");
    expect(readme).toContain("Standard Agent Shell");
    expect(readmeDe).toContain("Standard Agent Shell");
    expect(readme).toContain("Manual n8n Web UI");
    expect(readmeDe).toContain("Manuelle n8n Web-UI");
    expect(readme).toContain("Generic Cloud SaaS");
    expect(readmeDe).toContain("Generische Cloud-SaaS");
    expect(readme).toContain("100% Local Stdio Transport, Zero Telemetry");
    expect(readmeDe).toContain("100% lokaler Stdio-Transport, Zero Telemetrie");
    expect(readme).toContain("## Third-Party Licenses & Transparency");
    expect(readmeDe).toContain("## Drittanbieter-Lizenzen & Transparenz");
  });

  it("verifies 18-point quick navigation anchors across READMEs", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    const expectedAnchorsEn = [
      "1-architecture",
      "2-dual-mermaid-diagrams",
      "3-directory-status",
      "4-target-personas--discoverability",
      "5-comparative-matrix--alternatives",
      "6-core-capabilities--safety-invariants",
      "7-features",
      "8-installation",
      "9-quick-start",
      "10-available-tools",
      "11-optional-n8n-workflow-manager-seam",
      "12-configuration",
      "13-development",
      "14-ellmos-ai-ecosystem",
      "15-third-party-licenses--transparency",
      "16-marketing--personas-log",
      "17-changelog",
      "18-liability--statutory-notice",
    ];

    const expectedAnchorsDe = [
      "1-architektur",
      "2-duale-mermaid-diagramme",
      "3-verzeichnis-status",
      "4-zielgruppen--auffindbarkeit",
      "5-vergleichsmatrix--alternativen",
      "6-kernfaehigkeiten--sicherheitsinvarianten",
      "7-funktionen",
      "8-installation",
      "9-schnellstart",
      "10-verfuegbare-tools",
      "11-optional-anbindung-an-den-n8n-workflow-manager",
      "12-konfiguration",
      "13-entwicklung",
      "14-ellmos-ai-oekosystem",
      "15-drittanbieter-lizenzen--transparenz",
      "16-marketing--personas-protokoll",
      "17-aenderungsprotokoll",
      "18-sicherheitsrichtlinie--gesetzlicher-hinweis",
    ];

    for (const anchor of expectedAnchorsEn) {
      expect(readme, `README.md missing anchor ${anchor}`).toContain(`id="${anchor}"`);
    }
    for (const anchor of expectedAnchorsDe) {
      expect(readmeDe, `README_de.md missing anchor ${anchor}`).toContain(`id="${anchor}"`);
    }
  });

  it("verifies canonical persona tags [PERSONA-01] through [PERSONA-04] across READMEs and MARKETING-LOG", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");
    const marketing = fs.readFileSync(path.join(repoRoot, "MARKETING-LOG.txt"), "utf-8");

    const personas = ["[PERSONA-01]", "[PERSONA-02]", "[PERSONA-03]", "[PERSONA-04]"];
    for (const p of personas) {
      expect(readme, `README.md missing ${p}`).toContain(p);
      expect(readmeDe, `README_de.md missing ${p}`).toContain(p);
      expect(marketing, `MARKETING-LOG.txt missing ${p}`).toContain(p);
    }
  });

  it("verifies package.json keywords saturation and discoverability terms", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8")) as {
      keywords?: string[];
    };

    expect(pkg.keywords).toBeDefined();
    expect(pkg.keywords?.length).toBe(20);
    expect(pkg.keywords).toContain("local-first");
    expect(pkg.keywords).toContain("zero-egress");
    expect(pkg.keywords).toContain("claude-code");
    expect(pkg.keywords).toContain("mcp-server");
    expect(pkg.keywords).toContain("n8n-workflows");
  });

  it("verifies 18-point quick navigation parity and dual reciprocal anchors across English and German READMEs", () => {
    const readmeEn = fs.readFileSync(path.join(repoRoot, "README.md"), "utf-8");
    const readmeDe = fs.readFileSync(path.join(repoRoot, "README_de.md"), "utf-8");

    expect(readmeEn).toContain("## Quick Navigation");
    expect(readmeDe).toContain("## Schnellnavigation");

    for (let i = 1; i <= 18; i++) {
      const pad = String(i).padStart(2, "0");
      expect(readmeEn, `README.md missing sec-${pad}`).toContain(`id="sec-${pad}"`);
      expect(readmeDe, `README_de.md missing sec-${pad}`).toContain(`id="sec-${pad}"`);
      expect(readmeEn, `README.md missing #sec-${pad}`).toContain(`#sec-${pad}`);
      expect(readmeDe, `README_de.md missing #sec-${pad}`).toContain(`#sec-${pad}`);
    }

    expect(readmeEn).toContain('id="statutory-notice--liability"');
    expect(readmeDe).toContain('id="statutory-notice--liability"');
    expect(readmeEn).toContain("§ 521 German Civil Code");
    expect(readmeDe).toContain("§ 521 BGB");
    expect(readmeEn).toContain("48 hours");
    expect(readmeDe).toContain("48 Stunden");
  });

  it("verifies formal governance invariants INV-LOCAL-01 through INV-SLA-10 in THIRD_PARTY_LICENSES.md", () => {
    const licenses = fs.readFileSync(path.join(repoRoot, "THIRD_PARTY_LICENSES.md"), "utf-8");

    expect(licenses).toContain("Architectural & Governance Invariants Compliance Matrix");
    expect(licenses).toContain("Level 1 SBOM");
    expect(licenses).toContain("Stand: 2026-09-26");
    expect(licenses).toContain("RunAsInvoker");
    const invariants = [
      "INV-LOCAL-01",
      "INV-READ-02",
      "INV-BACK-03",
      "INV-AUDIT-04",
      "INV-SRV-05",
      "INV-TRAV-06",
      "INV-PRIV-07",
      "INV-SEAM-08",
      "INV-NODE-09",
      "INV-SLA-10",
    ];
    for (const inv of invariants) {
      expect(licenses, `THIRD_PARTY_LICENSES.md missing invariant ${inv}`).toContain(inv);
    }
  });

  it("verifies root NOTICE file attribution and copyright integrity", () => {
    const noticePath = path.join(repoRoot, "NOTICE");
    expect(fs.existsSync(noticePath), "Missing NOTICE file").toBe(true);
    const notice = fs.readFileSync(noticePath, "utf-8");

    expect(notice).toContain("n8n-manager-mcp");
    expect(notice).toContain("Lukas Geiger");
    expect(notice).toContain("<lukas@open-bricks.org>");
    expect(notice).toContain("ellmos-ai");
    expect(notice).toContain("open-bricks");
    expect(notice).toContain("MIT License");
  });

  it("verifies CHANGELOG.md contains recent Pfad A and Pfad B release entries", () => {
    const changelog = fs.readFileSync(path.join(repoRoot, "CHANGELOG.md"), "utf-8");
    expect(changelog).toContain("## [Unreleased]");
    expect(changelog).toContain("Pfad B: 2026-09-26");
    expect(changelog).toContain("Pfad A Technical Hygiene");
    expect(changelog).toContain("Formal NOTICE Attribution");
  });

  it("verifies MARKETING-LOG.txt contains Pfad B Stand 2026-09-26 audit entry", () => {
    const marketing = fs.readFileSync(path.join(repoRoot, "MARKETING-LOG.txt"), "utf-8");
    expect(marketing).toContain("Last Updated: 2026-09-26");
    expect(marketing).toContain("11. PATH B DISCOVERABILITY, 18-POINT NAVIGATION PARITY & LEVEL 1 SBOM AUDIT (2026-09-26)");
  });
});
