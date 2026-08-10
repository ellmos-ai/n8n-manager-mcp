import { describe, expect, it } from "vitest";
import { isEnvironmentReadOnly, resolveSafety } from "../src/safety.js";

describe("environment-enforced read-only mode", () => {
  it.each(["1", "true", "TRUE", "yes", "on"])("recognizes %s as enabled", value => {
    expect(isEnvironmentReadOnly(value)).toBe(true);
  });

  it("cannot be disabled by persisted safety settings", () => {
    expect(resolveSafety({ readOnly: false }, true).readOnly).toBe(true);
  });

  it("preserves persisted read-only mode without the environment flag", () => {
    expect(resolveSafety({ readOnly: true }, false).readOnly).toBe(true);
  });

  it("keeps mutable mode when neither source enables read-only", () => {
    expect(resolveSafety({ readOnly: false }, false).readOnly).toBe(false);
  });
});
