import { describe, expect, it } from "vitest";
import { redactApiKey, redactApiKeys, selectApiKey } from "../src/credentials.js";

const sentinel = "SYNTHETIC_N8N_KEY_DO_NOT_USE_758255363";

describe("API key source and output boundary", () => {
  it("uses a host key for new and updated profiles, retaining old profiles when unset", () => {
    expect(selectApiKey(undefined, sentinel, false)).toBe(sentinel);
    expect(selectApiKey("stored-key", sentinel, false)).toBe("stored-key");
    expect(selectApiKey("stored-key", sentinel, true)).toBe(sentinel);
    expect(selectApiKey("stored-key", undefined, false)).toBe("stored-key");
    expect(selectApiKey("stored-key", undefined, true)).toBe("");
    expect(selectApiKey("stored-key", "", true)).toBe("");
    expect(selectApiKey(undefined, undefined, false)).toBe("");
  });

  it("redacts an echoed request key from nested upstream error data", () => {
    const error = { error: `Bad header ${sentinel}`, details: [sentinel, { hint: sentinel }] };
    const redacted = redactApiKey(error, sentinel);
    expect(JSON.stringify(redacted)).not.toContain(sentinel);
    expect(redacted).toEqual({
      error: "Bad header [REDACTED_API_KEY]",
      details: ["[REDACTED_API_KEY]", { hint: "[REDACTED_API_KEY]" }],
    });
  });

  it("redacts JSON object keys and overlapping former and current secrets", () => {
    const shorter = "SYNTHETIC_N8N_KEY";
    const payload = { [sentinel]: `${shorter}|${sentinel}`, nested: { [shorter]: sentinel } };
    const redacted = redactApiKeys(payload, [shorter, sentinel]);
    expect(JSON.stringify(redacted)).not.toContain(shorter);
    expect(JSON.stringify(redacted)).not.toContain(sentinel);
    expect(redacted).toEqual({
      "[REDACTED_API_KEY]": "[REDACTED_API_KEY]|[REDACTED_API_KEY]",
      nested: { "[REDACTED_API_KEY]": "[REDACTED_API_KEY]" },
    });
  });

  it("keeps serialized JSON valid while redacting a quoted and backslashed key", () => {
    const specialKey = String.raw`SYNTHETIC_QUOTE_"_SLASH_\_758255363`;
    const serialized = JSON.stringify({ [specialKey]: specialKey }, null, 2);
    const redacted = redactApiKey(serialized, specialKey) as string;
    expect(JSON.parse(redacted)).toEqual({ "[REDACTED_API_KEY]": "[REDACTED_API_KEY]" });
    expect(redactApiKey(`Error: ${specialKey}`, specialKey)).toBe("Error: [REDACTED_API_KEY]");
  });

  it("redacts keys in prefixed errors with repeatedly serialized JSON", () => {
    const specialKey = String.raw`SYNTHETIC_QUOTE_"_SLASH_\_758255363`;
    for (const depth of [1, 2, 3, 8]) {
      let nested = specialKey;
      for (let level = 0; level < depth; level++) {
        nested = JSON.stringify({ headers: nested });
      }
      const upstream = `Request failed: ${nested}`;
      const requestData = redactApiKey({ error: upstream }, specialKey);
      const result = redactApiKeys({ content: [{ type: "text", text: JSON.stringify(requestData) }] }, [specialKey]);
      const audit = redactApiKeys({ message: JSON.stringify(requestData) }, [specialKey]);
      for (const boundary of [result, audit]) {
        const encoded = JSON.stringify(boundary);
        expect(encoded).toContain("[REDACTED_API_KEY]");
        expect(encoded).not.toContain("SYNTHETIC_QUOTE_");
      }
    }
  });
});
