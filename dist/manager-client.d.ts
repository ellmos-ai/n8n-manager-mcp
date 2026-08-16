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
export declare const MANAGER_URL_ENV = "N8N_MCP_MANAGER_URL";
export declare const DEFAULT_TIMEOUT_MS = 5000;
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
export declare class ManagerUnavailable extends Error {
    constructor(message: string);
}
export declare function isLoopbackHost(hostname: string): boolean;
/**
 * Validate the configured manager base URL. Returns null when the seam is not
 * configured; throws on a value that is set but unusable, so a typo surfaces
 * instead of silently disabling the seam.
 */
export declare function resolveManagerUrl(value?: string | undefined): string | null;
/** Measure the seam: is it configured, and does the manager actually answer? */
export declare function probeManager(url: string | null, fetchImpl?: FetchLike, timeoutMs?: number): Promise<ManagerStatus>;
export interface ManagerWorkflowSummary {
    id: number;
    name: string;
    source?: string;
    is_active?: number | boolean;
}
/** List the workflows the manager knows, so a caller can find a local ID. */
export declare function listManagerWorkflows(baseUrl: string, fetchImpl?: FetchLike, timeoutMs?: number): Promise<ManagerWorkflowSummary[]>;
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
export declare function fetchWorkflowHistory(baseUrl: string, workflowId: number, limit?: number, fetchImpl?: FetchLike, timeoutMs?: number): Promise<ManagerHistory>;
export declare function formatWorkflowIndex(workflows: ManagerWorkflowSummary[], baseUrl: string): string;
export declare function formatHistory(history: ManagerHistory, limit: number): string;
//# sourceMappingURL=manager-client.d.ts.map