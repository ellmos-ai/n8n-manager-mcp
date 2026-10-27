/** A secret supplied by the MCP host, never by an MCP tool call. */
export const N8N_API_KEY_ENV = "N8N_MANAGER_API_KEY";
export const N8N_SERVER_URL_ENV = "N8N_MANAGER_SERVER_URL";
/** Existing profiles keep their stored key when the host does not supply a replacement. */
export function selectApiKey(existingKey, environmentKey, rotateKey) {
    return existingKey !== undefined && !rotateKey ? existingKey : environmentKey ?? "";
}
/** Upstream data can echo request headers, including in object keys. */
export function redactApiKey(value, apiKey) {
    if (!apiKey)
        return value;
    if (typeof value === "string")
        return value.replaceAll(apiKey, "[REDACTED_API_KEY]");
    if (Array.isArray(value))
        return value.map(item => redactApiKey(item, apiKey));
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [
            redactApiKey(key, apiKey),
            redactApiKey(item, apiKey),
        ]));
    }
    return value;
}
/** Longer keys first so overlapping values cannot leave a suffix behind. */
export function redactApiKeys(value, apiKeys) {
    const keys = [...new Set(apiKeys)].filter(Boolean).sort((a, b) => b.length - a.length);
    return keys.reduce((result, key) => redactApiKey(result, key), value);
}
//# sourceMappingURL=credentials.js.map