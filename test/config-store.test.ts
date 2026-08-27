import { describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { writeJsonFileAtomically } from "../src/config-store.js";

describe("writeJsonFileAtomically", () => {
  it("replaces an existing configuration with valid JSON and leaves no temporary files", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "n8n-manager-config-"));
    const configPath = path.join(directory, "servers.json");
    await fs.writeFile(configPath, '{"servers":["old"]}', "utf-8");

    try {
      const next = { servers: [{ name: "production" }], safety: { readOnly: true } };
      await writeJsonFileAtomically(configPath, next);

      await expect(fs.readFile(configPath, "utf-8")).resolves.toBe(JSON.stringify(next, null, 2));
      await expect(fs.readdir(directory)).resolves.toEqual(["servers.json"]);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });
});
