/**
 * i18n Type Definitions for n8n Manager MCP Server
 * Reference: .SOFTWARE/_LANG/LANGUAGE_CODES.md
 */

export interface Translations {
  common: {
    error: (msg: string) => string;
    success: (msg: string) => string;
    serverStarted: string;
    notFound: (item: string) => string;
  };

  server: {
    added: (name: string) => string;
    removed: (name: string) => string;
    connected: (name: string) => string;
    unreachable: (name: string) => string;
    noServers: string;
  };

  workflow: {
    listed: (count: number) => string;
    created: (name: string) => string;
    updated: (name: string) => string;
    deleted: (name: string) => string;
    activated: (name: string) => string;
    deactivated: (name: string) => string;
    exported: (name: string) => string;
    imported: (name: string) => string;
    notFound: (id: string) => string;
  };

  execution: {
    listed: (count: number) => string;
    noExecutions: string;
  };
}
