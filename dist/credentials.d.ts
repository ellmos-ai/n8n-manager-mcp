/** A secret supplied by the MCP host, never by an MCP tool call. */
export declare const N8N_API_KEY_ENV = "N8N_MANAGER_API_KEY";
export declare const N8N_SERVER_URL_ENV = "N8N_MANAGER_SERVER_URL";
/** Existing profiles keep their stored key when the host does not supply a replacement. */
export declare function selectApiKey(existingKey: string | undefined, environmentKey: string | undefined, rotateKey: boolean): string;
/** An upstream error can echo request headers. Keep the key out of tool and audit output. */
export declare function redactApiKey(value: unknown, apiKey: string): unknown;
//# sourceMappingURL=credentials.d.ts.map