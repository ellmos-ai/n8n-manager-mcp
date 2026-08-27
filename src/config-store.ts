import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Replace a JSON file without ever exposing a partially written destination.
 *
 * The temporary file is created beside the destination so `rename` remains an
 * atomic same-volume operation. This matters for servers.json: an interrupted
 * direct write previously made the MCP fall back to an empty configuration.
 */
export async function writeJsonFileAtomically(filePath: string, value: unknown): Promise<void> {
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${randomUUID()}.tmp`,
  );

  try {
    await fs.writeFile(temporaryPath, JSON.stringify(value, null, 2), "utf-8");
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}
