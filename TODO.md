# n8n-manager-mcp TODO

## STATUS (Stand: 2026-11-08 / Version 0.1.21)

| Gate | Mandat / Kriterium | Status | Beleg / Nachweis |
| :--- | :--- | :--- | :--- |
| Gate 1 | Repository Hygiene & `.gitignore` | PASS | `.gitignore` schützt Credentials, Multi-Agent-Locks, Sync-Konflikte und Test-Caches |
| Gate 2 | Lokale Lauffähigkeit & Build | PASS | `npm run build` kompiliert TypeScript fehlerfrei nach `dist/` (Exit 0) |
| Gate 3 | Testabdeckung & Vitest | PASS | Vitest Testsuite 100% grün (209 Tests PASS) |
| Gate 4 | MCP-Protokoll & Smoke-Test | PASS | `npm run smoke`: 19 Tools validiert, `n8n_describe_nodes` Handshake erfolgreich |
| Gate 5 | Lokaler Transport & Zero-Egress | PASS | Stdio JSON-RPC 2.0, isolierte Serverprofile, RunAsInvoker (INV-LOCAL-01 bis INV-PRIV-07) |
| Gate 6 | Secrets & Pfad-Datenschutz | PASS | 0 echte Credentials, 0 persönliche Windows-Entwicklerpfade (`C:\Users\lukas\...`) |
| Gate 7 | Supply-Chain & Dependency Audit | PASS | `npm audit`: 0 Schwachstellen across 195 Paketen, SDK `^1.32.2`, Zod `^4.6.7`, Pinned Overrides |
| Gate 8 | Level 1 SBOM & Lizenz-Transparenz | PASS | `THIRD_PARTY_LICENSES.md` & `.txt` Re-Audit Stand 2026-11-08, 100% Permissive Open Source |
| Gate 9 | Mehrsprachige Dokumentation & Navigation | PASS | 11 Sprachen (EN, DE, ES, JA, RU, FR, ZH, HI, AR, BN, PT) mit reziproker Schnellnavigation |
| Gate 10 | Aufgaben- & Release-Governance | PASS | Kanonisches `TODO.md`, `CHANGELOG.md`, `NOTICE`, strikt eingefrorene Version 0.1.21 |

---

## AI Security & Dependency Audit (2026-11-08)

- [x] Umfassendes Supply-Chain- und Schwachstellen-Audit (`npm audit` -> 0 Schwachstellen across 195 Paketen).
- [x] `@modelcontextprotocol/sdk` auf `^1.32.2` aktualisiert (Behebung von Upstream-Sicherheitsadvisories GHSA-6qxp-vccf-f47h, GHSA-22jm-h49p-29qw, GHSA-6prh-2h8m-c8cw, GHSA-46jr-4wx8-v453, GHSA-rvq5-wwqv-78pq, GHSA-f897-62hf-6gxq).
- [x] `zod` auf `^4.6.7` gehärtet (Mitigierung von Memory-Exhaustion GHSA-mrhx-c7xc-m3w5).
- [x] Supply-Chain-Sicherheits-Overrides in `package.json` an Musketier-/MCP-Flottenstandard angeglichen und gepinnt:
  - `proxy-addr` (`^2.0.8`, kritische Schwachstelle GHSA-jqcg-44mw-7w3h)
  - `body-parser` (`^2.4.0`, hohe Schwachstelle GHSA-27r3-jxmh-p828)
  - `source-map-js` (`^1.2.2`, transitive Schwachstelle GHSA-68fv-2mgg-jv7q)
  - `@hono/node-server` (`^2.1.5`, aktualisiert von `^2.1.3`)
  - `qs` (`^6.17.1`, aktualisiert von `^6.16.1`)
  - `vitest` (`^4.1.12`, aktualisiert von `^4.1.11`)
  - `@vitest/mocker` (`^4.1.12`)
  - `ip-address` (`^10.7.5`)
  - `postcss` (`^8.5.18`)
  - `fast-uri` (`^3.1.9`)
  - `express-rate-limit` (`^8.6.2`)
  - `nanoid` (`^3.3.17`)
  - `hono` (`^4.13.13`)
- [x] Level 1 SBOM Dokumente (`THIRD_PARTY_LICENSES.md` und `THIRD_PARTY_LICENSES.txt`) auf Re-Audit Stand 2026-11-08 harmonisiert.
- [x] AST- und Regex-Scan aller getrackten Quelldateien, Konfigurationen und Manifeste: 0 echte Credentials, 0 API-Keys, 0 Private Keys und 0 persönliche Windows-Entwicklerpfade (`C:\Users\lukas\...`).
- [x] Kanonisches `TODO.md` Aufgaben- und Statusregister im Repository etabliert.
- [x] Vertragstestsuite (`test/metadata.test.ts`) um automatisierten Sicherheits- und Governance-Vertragstest erweitert (`test_security_and_dependency_audit_contract`).
- [x] Bitgenaue Plan-D-Synchronisation nach OneDrive (`.MCP/n8n-manager-mcp`) via `repo_mirror.py --apply`.

---

## Geplante Erweiterungen & Roadmap

- [ ] Optionaler n8n Staging Diff Viewer: Automatisierter visueller Vergleich von Node-Konfigurationen zwischen Staging- und Produktions-Workflows.
- [ ] Export von Workflow-Ausführungsmetriken in das ControlCenter MCP Monitoring-Dashboard.
