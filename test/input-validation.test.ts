import { describe, expect, it } from "vitest";
import {
  connectionIndexInputSchema,
  connectionIndexSchema,
  listBackupsLimitSchema,
  listExecutionsLimitSchema,
  listLimitSchema,
  listWorkflowsLimitSchema,
  MAX_CONNECTION_INDEX,
  MAX_LIST_LIMIT,
} from "../src/input-validation.js";

describe("MCP numeric input guardrails", () => {
  it("keeps the documented list defaults and accepts both boundaries", () => {
    expect(listWorkflowsLimitSchema.parse(undefined)).toBe(100);
    expect(listExecutionsLimitSchema.parse(undefined)).toBe(20);
    expect(listBackupsLimitSchema.parse(undefined)).toBe(20);
    expect(listLimitSchema.parse(1)).toBe(1);
    expect(listLimitSchema.parse(MAX_LIST_LIMIT)).toBe(MAX_LIST_LIMIT);
  });

  it.each([null, 0, -1, 1.5, MAX_LIST_LIMIT + 1, Number.MAX_SAFE_INTEGER, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid list limit %s before a handler can use it",
    (value) => {
      expect(listLimitSchema.safeParse(value).success).toBe(false);
    },
  );

  it("keeps the connection default and accepts output/input index boundaries", () => {
    expect(connectionIndexInputSchema.parse(undefined)).toBe(0);
    expect(connectionIndexSchema.parse(0)).toBe(0);
    expect(connectionIndexSchema.parse(MAX_CONNECTION_INDEX)).toBe(MAX_CONNECTION_INDEX);
  });

  it.each([null, -1, 1.5, MAX_CONNECTION_INDEX + 1, Number.MAX_SAFE_INTEGER, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid workflow connection index %s before array access",
    (value) => {
      expect(connectionIndexSchema.safeParse(value).success).toBe(false);
    },
  );
});
