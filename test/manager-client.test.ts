/**
 * Tests for the optional n8n-workflow-manager adapter seam.
 *
 * These import the shipped module directly and drive it against a local stub
 * HTTP server, so the real request path is exercised rather than a copy of it.
 * No n8n instance and no real manager installation are contacted.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as http from "node:http";
import type { AddressInfo } from "node:net";

import {
  DEFAULT_TIMEOUT_MS,
  MANAGER_URL_ENV,
  ManagerUnavailable,
  fetchWorkflowHistory,
  formatHistory,
  formatWorkflowIndex,
  isLoopbackHost,
  listManagerWorkflows,
  probeManager,
  resolveManagerUrl,
  type FetchLike,
} from "../src/manager-client.js";

// ============================================================================
// Stub manager -- mirrors the response shapes of n8nManager/api
// ============================================================================

let server: http.Server;
let baseUrl: string;
const requestedPaths: string[] = [];

beforeAll(async () => {
  server = http.createServer((req, res) => {
    requestedPaths.push(req.url || "");
    const url = req.url || "";
    const send = (status: number, body: unknown, contentType = "application/json") => {
      res.writeHead(status, { "Content-Type": contentType });
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    };

    if (url === "/api/status") {
      return send(200, { status: "running", version: "0.2.3", workflows: 2, servers: 1 });
    }
    if (url === "/api/workflows") {
      return send(200, {
        data: [
          { id: 1, name: "Nightly backup", source: "pull", is_active: 1 },
          { id: 7, name: "Draft", source: "api", is_active: 0 },
        ],
        count: 2,
      });
    }
    if (url.startsWith("/api/workflows/1/history")) {
      return send(200, {
        workflow_id: 1,
        workflow_name: "Nightly backup",
        versions: [{ version_number: 2, created_at: "2026-08-13T09:00:00Z", action: "update" }],
        decisions: [
          { created_at: "2026-08-13T09:00:00Z", action: "update", decision: "Raised the retry count" },
        ],
        sync: [{ created_at: "2026-08-13T09:01:00Z", direction: "push", status: "success" }],
        remote_bindings: [{ server_id: 1, n8n_id: "abc123" }],
        mutation_policy: "Read this history and provide a non-empty decision before update.",
      });
    }
    if (url.startsWith("/api/workflows/404/history")) {
      return send(404, { detail: "Workflow not found" });
    }
    if (url.startsWith("/api/workflows/500/history")) {
      return send(500, { detail: "boom" });
    }
    if (url.startsWith("/api/workflows/999/history")) {
      return send(200, "<html>not json</html>", "text/html");
    }
    return send(404, { detail: "unknown stub route" });
  });

  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

// ============================================================================
// Configuration resolution
// ============================================================================

describe("resolveManagerUrl", () => {
  it("returns null when the seam is not configured", () => {
    expect(resolveManagerUrl(undefined)).toBeNull();
    expect(resolveManagerUrl("")).toBeNull();
    expect(resolveManagerUrl("   ")).toBeNull();
  });

  it("normalizes a valid URL and strips trailing slashes", () => {
    expect(resolveManagerUrl("http://127.0.0.1:8100/")).toBe("http://127.0.0.1:8100");
    expect(resolveManagerUrl("  https://manager.example:8443  ")).toBe("https://manager.example:8443");
  });

  it("rejects a value that is set but unusable instead of silently disabling the seam", () => {
    expect(() => resolveManagerUrl("not-a-url")).toThrow(ManagerUnavailable);
    expect(() => resolveManagerUrl("ftp://127.0.0.1:8100")).toThrow(/http or https/);
    expect(() => resolveManagerUrl("http://user:pw@127.0.0.1:8100")).toThrow(/credentials/);
    expect(() => resolveManagerUrl("http://127.0.0.1:8100/?x=1")).toThrow(/query string/);
  });

  it("names the environment variable in its error messages", () => {
    expect(() => resolveManagerUrl("not-a-url")).toThrow(new RegExp(MANAGER_URL_ENV));
  });
});

describe("isLoopbackHost", () => {
  it.each(["127.0.0.1", "127.5.5.5", "localhost", "LOCALHOST", "::1", "[::1]"])(
    "treats %s as loopback",
    host => expect(isLoopbackHost(host)).toBe(true),
  );

  it.each(["example.com", "10.0.0.5", "192.168.1.10"])("treats %s as remote", host =>
    expect(isLoopbackHost(host)).toBe(false),
  );
});

// ============================================================================
// Probing -- measured state, not configuration
// ============================================================================

describe("probeManager", () => {
  it("reports the off state when nothing is configured", async () => {
    const status = await probeManager(null);
    expect(status).toMatchObject({ configured: false, reachable: false, url: null });
    expect(status.detail).toContain(MANAGER_URL_ENV);
  });

  it("reports measured reachability and manager metadata", async () => {
    const status = await probeManager(baseUrl);
    expect(status).toMatchObject({
      configured: true,
      reachable: true,
      loopback: true,
      version: "0.2.3",
      workflows: 2,
      servers: 1,
    });
  });

  it("reports configured-but-unreachable rather than pretending it is off", async () => {
    const dead = "http://127.0.0.1:9"; // discard port, nothing listens
    const status = await probeManager(dead, fetch, 1500);
    expect(status.configured).toBe(true);
    expect(status.reachable).toBe(false);
    expect(status.detail).toContain(dead);
  });

  it("flags a non-loopback manager because its API is unauthenticated", async () => {
    const failing: FetchLike = async () => {
      throw new Error("no route");
    };
    const status = await probeManager("https://manager.example", failing, 100);
    expect(status.loopback).toBe(false);
  });
});

// ============================================================================
// Reads against the stub
// ============================================================================

describe("listManagerWorkflows", () => {
  it("returns the manager's local workflow IDs", async () => {
    const workflows = await listManagerWorkflows(baseUrl);
    expect(workflows).toHaveLength(2);
    expect(workflows[0]).toMatchObject({ id: 1, name: "Nightly backup" });
  });

  it("tolerates a payload without a data array", async () => {
    const empty: FetchLike = async () =>
      new Response(JSON.stringify({ count: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    expect(await listManagerWorkflows(baseUrl, empty)).toEqual([]);
  });
});

describe("fetchWorkflowHistory", () => {
  it("returns versions, decisions, sync entries and remote bindings", async () => {
    const history = await fetchWorkflowHistory(baseUrl, 1);
    expect(history.workflow_name).toBe("Nightly backup");
    expect(history.versions).toHaveLength(1);
    expect(history.decisions?.[0]).toMatchObject({ decision: "Raised the retry count" });
    expect(history.remote_bindings?.[0]).toMatchObject({ n8n_id: "abc123" });
  });

  it("clamps the limit into the range the manager accepts", async () => {
    requestedPaths.length = 0;
    await fetchWorkflowHistory(baseUrl, 1, 5000);
    await fetchWorkflowHistory(baseUrl, 1, 0);
    expect(requestedPaths).toEqual([
      "/api/workflows/1/history?limit=500",
      "/api/workflows/1/history?limit=1",
    ]);
  });

  it("rejects an ID that cannot be a manager workflow ID", async () => {
    await expect(fetchWorkflowHistory(baseUrl, 0)).rejects.toThrow(ManagerUnavailable);
    await expect(fetchWorkflowHistory(baseUrl, -1)).rejects.toThrow(/positive integer/);
    await expect(fetchWorkflowHistory(baseUrl, 1.5)).rejects.toThrow(ManagerUnavailable);
  });

  it("surfaces manager HTTP errors instead of returning empty history", async () => {
    await expect(fetchWorkflowHistory(baseUrl, 404)).rejects.toThrow(/HTTP 404/);
    await expect(fetchWorkflowHistory(baseUrl, 500)).rejects.toThrow(/HTTP 500/);
  });

  it("surfaces a non-JSON body instead of guessing", async () => {
    await expect(fetchWorkflowHistory(baseUrl, 999)).rejects.toThrow(/non-JSON/);
  });
});

// ============================================================================
// The rule this seam exists to keep: no silent fallback
// ============================================================================

describe("no silent fallback to the n8n instance", () => {
  it("fails with an explicit refusal when the configured manager is down", async () => {
    const contacted: string[] = [];
    const failing: FetchLike = async input => {
      contacted.push(input);
      throw new Error("ECONNREFUSED");
    };
    await expect(fetchWorkflowHistory("http://127.0.0.1:8100", 1, 100, failing)).rejects.toThrow(
      /Refusing to query the n8n instance instead/,
    );
    // Only the manager was contacted; no n8n endpoint was substituted.
    expect(contacted).toEqual(["http://127.0.0.1:8100/api/workflows/1/history?limit=100"]);
  });

  it("tells the operator how to resolve it", async () => {
    const failing: FetchLike = async () => {
      throw new Error("ECONNREFUSED");
    };
    await expect(probeManager("http://127.0.0.1:8100", failing).then(s => s.detail)).resolves.toMatch(
      /n8n-manager serve/,
    );
  });

  it("aborts instead of hanging when the manager stops responding", async () => {
    const hanging: FetchLike = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("The operation was aborted")));
      });
    await expect(fetchWorkflowHistory(baseUrl, 1, 100, hanging, 50)).rejects.toThrow(
      ManagerUnavailable,
    );
  });

  it("uses a bounded default timeout", () => {
    expect(DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
    expect(DEFAULT_TIMEOUT_MS).toBeLessThanOrEqual(30000);
  });
});

// ============================================================================
// Formatting
// ============================================================================

describe("output formatting", () => {
  it("marks manager IDs as distinct from n8n IDs in the index", () => {
    const text = formatWorkflowIndex(
      [{ id: 1, name: "Nightly backup", source: "pull", is_active: 1 }],
      baseUrl,
    );
    expect(text).toContain("not n8n instance IDs");
    expect(text).toContain("[1] Nightly backup (ACTIVE, from pull)");
  });

  it("explains an empty manager store instead of printing nothing", () => {
    expect(formatWorkflowIndex([], baseUrl)).toContain("no workflows yet");
  });

  it("renders every history section, including empty ones", () => {
    const text = formatHistory(
      { workflow_id: 3, workflow_name: "Test", versions: [], decisions: [], sync: [] },
      50,
    );
    for (const section of ["Versions:", "Decisions:", "Sync:", "Remote bindings:"]) {
      expect(text).toContain(section);
    }
    expect(text).toContain("(none)");
  });

  it("shows the recorded decision text, which is what the manager adds over raw n8n", async () => {
    const text = formatHistory(await fetchWorkflowHistory(baseUrl, 1), 100);
    expect(text).toContain("Raised the retry count");
    expect(text).toContain("Mutation policy:");
  });
});
