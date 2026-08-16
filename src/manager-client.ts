/**
 * Optional adapter seam towards the n8n-workflow-manager module.
 *
 * The MCP server talks to n8n instances directly. The manager module keeps a
 * local-first store on top of those instances: versions, recorded decisions,
 * sync history and remote bindings. Where that module is running, this seam
 * lets MCP clients read its history instead of only seeing the flat local
 * backup files.
 *
 * Two rules hold here:
 *
 * 1. The seam is opt-in. Without N8N_MCP_MANAGER_URL nothing changes.
 * 2. It never falls back to a direct n8n call. A configured but unreachable
 *    manager is an error, because a silent substitution would return data
 *    from a different store than the caller asked for.
 */

export const MANAGER_URL_ENV = "N8N_MCP_MANAGER_URL";
export const DEFAULT_TIMEOUT_MS = 5000;

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface ManagerStatus {
  configured: boolean;
  url: string | null;
  reachable: boolean;
  detail: string;
  loopback: boolean;
  version?: string;
  workflows?: number;
  servers?: number;
}

/** Thrown when the manager is configured but cannot serve the request. */
export class ManagerUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManagerUnavailable";
  }
}

export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "::1" || /^127\./.test(host);
}

/**
 * Validate the configured manager base URL. Returns null when the seam is not
 * configured; throws on a value that is set but unusable, so a typo surfaces
 * instead of silently disabling the seam.
 */
export function resolveManagerUrl(
  value: string | undefined = process.env[MANAGER_URL_ENV],
): string | null {
  const raw = (value || "").trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ManagerUnavailable(
      `${MANAGER_URL_ENV} is not a valid URL: ${raw}. Expected something like http://127.0.0.1:8100`,
    );
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ManagerUnavailable(`${MANAGER_URL_ENV} must use http or https.`);
  }
  if (parsed.username || parsed.password) {
    throw new ManagerUnavailable(`${MANAGER_URL_ENV} must not contain embedded credentials.`);
  }
  if (parsed.search || parsed.hash) {
    throw new ManagerUnavailable(`${MANAGER_URL_ENV} must not contain a query string or fragment.`);
  }
  return parsed.toString().replace(/\/+$/, "");
}

async function managerRequest(
  baseUrl: string,
  endpoint: string,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ManagerUnavailable(
      `n8n-workflow-manager at ${baseUrl} did not answer (${reason}). ` +
        `Start it with "n8n-manager serve", or unset ${MANAGER_URL_ENV} to use the direct n8n tools. ` +
        `Refusing to query the n8n instance instead, because that store has no version or decision history.`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ManagerUnavailable(
      `n8n-workflow-manager at ${baseUrl} answered HTTP ${response.status} for ${endpoint}.`,
    );
  }
  try {
    return await response.json();
  } catch {
    throw new ManagerUnavailable(
      `n8n-workflow-manager at ${baseUrl} returned a non-JSON body for ${endpoint}.`,
    );
  }
}

/** Measure the seam: is it configured, and does the manager actually answer? */
export async function probeManager(
  url: string | null,
  fetchImpl: FetchLike = fetch,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ManagerStatus> {
  if (!url) {
    return {
      configured: false,
      url: null,
      reachable: false,
      loopback: false,
      detail: `not configured (direct n8n mode); set ${MANAGER_URL_ENV} to enable the manager seam`,
    };
  }
  const loopback = isLoopbackHost(new URL(url).hostname);
  try {
    const payload = (await managerRequest(url, "/api/status", fetchImpl, timeoutMs)) as {
      status?: string;
      version?: string;
      workflows?: number;
      servers?: number;
    };
    return {
      configured: true,
      url,
      reachable: true,
      loopback,
      detail: payload.status ? `reachable (${payload.status})` : "reachable",
      version: payload.version,
      workflows: payload.workflows,
      servers: payload.servers,
    };
  } catch (error: unknown) {
    return {
      configured: true,
      url,
      reachable: false,
      loopback,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export interface ManagerWorkflowSummary {
  id: number;
  name: string;
  source?: string;
  is_active?: number | boolean;
}

/** List the workflows the manager knows, so a caller can find a local ID. */
export async function listManagerWorkflows(
  baseUrl: string,
  fetchImpl: FetchLike = fetch,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ManagerWorkflowSummary[]> {
  const payload = (await managerRequest(baseUrl, "/api/workflows", fetchImpl, timeoutMs)) as {
    data?: ManagerWorkflowSummary[];
  };
  return Array.isArray(payload?.data) ? payload.data : [];
}

export interface ManagerHistory {
  workflow_id: number;
  workflow_name?: string;
  versions?: Array<Record<string, unknown>>;
  decisions?: Array<Record<string, unknown>>;
  sync?: Array<Record<string, unknown>>;
  remote_bindings?: Array<Record<string, unknown>>;
  mutation_policy?: string;
}

/**
 * Fetch the history of one workflow. The ID is the manager's own local ID, not
 * the n8n instance ID -- the manager stores that mapping but exposes no route
 * to resolve it, so translation is deliberately not attempted here.
 */
export async function fetchWorkflowHistory(
  baseUrl: string,
  workflowId: number,
  limit = 100,
  fetchImpl: FetchLike = fetch,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ManagerHistory> {
  if (!Number.isInteger(workflowId) || workflowId < 1) {
    throw new ManagerUnavailable("workflow_id must be the manager's positive integer workflow ID.");
  }
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 500));
  return (await managerRequest(
    baseUrl,
    `/api/workflows/${workflowId}/history?limit=${safeLimit}`,
    fetchImpl,
    timeoutMs,
  )) as ManagerHistory;
}

function describeEntry(entry: Record<string, unknown>, fields: string[]): string {
  const parts = fields
    .filter(field => entry[field] !== undefined && entry[field] !== null && entry[field] !== "")
    .map(field => `${field}=${String(entry[field])}`);
  return parts.length > 0 ? parts.join(", ") : JSON.stringify(entry);
}

export function formatWorkflowIndex(workflows: ManagerWorkflowSummary[], baseUrl: string): string {
  if (workflows.length === 0) {
    return `n8n-workflow-manager at ${baseUrl} holds no workflows yet. Pull one with "n8n-manager pull" first.`;
  }
  const lines = [
    `Workflows in n8n-workflow-manager (${baseUrl}) -- these are manager IDs, not n8n instance IDs:\n`,
  ];
  for (const workflow of workflows) {
    const active = workflow.is_active ? "ACTIVE" : "inactive";
    const source = workflow.source ? `, from ${workflow.source}` : "";
    lines.push(`  [${workflow.id}] ${workflow.name} (${active}${source})`);
  }
  lines.push("\nPass workflow_id to see versions, recorded decisions, and sync history.");
  return lines.join("\n");
}

export function formatHistory(history: ManagerHistory, limit: number): string {
  const lines = [
    `History for manager workflow ${history.workflow_id}` +
      (history.workflow_name ? ` "${history.workflow_name}"` : "") +
      ` (showing up to ${limit} entries per section):\n`,
  ];

  const sections: Array<[string, Array<Record<string, unknown>> | undefined, string[]]> = [
    ["Versions", history.versions, ["version_number", "created_at", "action", "content_hash"]],
    ["Decisions", history.decisions, ["created_at", "action", "decision"]],
    ["Sync", history.sync, ["created_at", "direction", "status", "details"]],
    ["Remote bindings", history.remote_bindings, ["server_id", "n8n_id", "created_at"]],
  ];

  for (const [title, entries, fields] of sections) {
    lines.push(`${title}:`);
    if (!entries || entries.length === 0) {
      lines.push("  (none)");
    } else {
      for (const entry of entries) {
        lines.push(`  ${describeEntry(entry, fields)}`);
      }
    }
    lines.push("");
  }

  if (history.mutation_policy) {
    lines.push(`Mutation policy: ${history.mutation_policy}`);
  }
  return lines.join("\n").trimEnd();
}
