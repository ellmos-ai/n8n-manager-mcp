export const en = {
    common: {
        error: (msg) => `Error: ${msg}`,
        success: (msg) => `Success: ${msg}`,
        serverStarted: 'n8n Manager MCP Server started',
        notFound: (item) => `Not found: ${item}`,
    },
    server: {
        added: (name) => `Server added: ${name}`,
        removed: (name) => `Server removed: ${name}`,
        connected: (name) => `Connected to: ${name}`,
        unreachable: (name) => `Server unreachable: ${name}`,
        noServers: 'No servers configured',
    },
    workflow: {
        listed: (count) => `${count} workflow(s) found`,
        created: (name) => `Workflow created: ${name}`,
        updated: (name) => `Workflow updated: ${name}`,
        deleted: (name) => `Workflow deleted: ${name}`,
        activated: (name) => `Workflow activated: ${name}`,
        deactivated: (name) => `Workflow deactivated: ${name}`,
        exported: (name) => `Workflow exported: ${name}`,
        imported: (name) => `Workflow imported: ${name}`,
        notFound: (id) => `Workflow not found: ${id}`,
    },
    execution: {
        listed: (count) => `${count} execution(s) found`,
        noExecutions: 'No executions found',
    },
};
//# sourceMappingURL=en.js.map