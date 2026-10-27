import { describe, expect, it } from "vitest";
import { redactApiKey, selectApiKey } from "../src/credentials.js";

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
});
