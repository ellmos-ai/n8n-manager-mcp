/** A secret supplied by the MCP host, never by an MCP tool call. */
export const N8N_API_KEY_ENV = "N8N_MANAGER_API_KEY";
export const N8N_SERVER_URL_ENV = "N8N_MANAGER_SERVER_URL";

/** Existing profiles keep their stored key when the host does not supply a replacement. */
export function selectApiKey(
  existingKey: string | undefined,
  environmentKey: string | undefined,
  rotateKey: boolean,
): string {
  return existingKey !== undefined && !rotateKey ? existingKey : environmentKey ?? "";
}

/** Upstream data can echo request headers, including in object keys. */
export function redactApiKey(value: unknown, apiKey: string): unknown {
  if (!apiKey) return value;
  if (typeof value === "string") {
    // Tool handlers may have serialized an upstream object before this output
    // boundary. Parse JSON text first: replacing the raw key cannot find a
    // quoted/backslashed key, while replacing JSON syntax can corrupt it.
    try {
      const parsed: unknown = JSON.parse(value);
      const redacted = redactApiKey(parsed, apiKey);
      if (JSON.stringify(redacted) !== JSON.stringify(parsed)) {
        return JSON.stringify(redacted, null, value.includes("\n") ? 2 : undefined);
      }
    } catch { /* Plain text is handled below. */ }
    // Error text can prefix a JSON object containing another serialized JSON
    // string. The whole message then cannot be parsed, and its key can have
    // any number of escaping layers. Stop when the next form cannot fit.
    const forms = [apiKey];
    let form = apiKey;
    while (form.length <= value.length) {
      const escaped = JSON.stringify(form).slice(1, -1);
      if (escaped === form || escaped.length > value.length) break;
      forms.push(escaped);
      form = escaped;
    }
    return forms.reverse().reduce(
      (text, key) => text.replaceAll(key, "[REDACTED_API_KEY]"),
      value,
    );
  }
  if (Array.isArray(value)) return value.map(item => redactApiKey(item, apiKey));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        redactApiKey(key, apiKey) as string,
        redactApiKey(item, apiKey),
      ]),
    );
  }
  return value;
}

/** Longer keys first so overlapping values cannot leave a suffix behind. */
export function redactApiKeys(value: unknown, apiKeys: Iterable<string>): unknown {
  const keys = [...new Set(apiKeys)].filter(Boolean).sort((a, b) => b.length - a.length);
  return keys.reduce<unknown>((result, key) => redactApiKey(result, key), value);
}
