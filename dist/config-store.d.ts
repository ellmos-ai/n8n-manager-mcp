/**
 * Replace a JSON file without ever exposing a partially written destination.
 *
 * The temporary file is created beside the destination so `rename` remains an
 * atomic same-volume operation. This matters for servers.json: an interrupted
 * direct write previously made the MCP fall back to an empty configuration.
 */
export declare function writeJsonFileAtomically(filePath: string, value: unknown): Promise<void>;
//# sourceMappingURL=config-store.d.ts.map